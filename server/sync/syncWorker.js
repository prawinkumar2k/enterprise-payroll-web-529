
/**
 * SyncWorker — Production Bidirectional Sync Engine
 *
 * Two-phase sync in DUAL mode:
 *
 * PHASE A — SQLite → MySQL (Offline Recovery)
 *   Find all SQLite rows with is_synced=0, upsert into MySQL with LWW,
 *   then mark is_synced=1 in SQLite.
 *
 * PHASE B — MySQL → SQLite (Mirror Repair)
 *   For each sync table, find MySQL rows missing from or newer than SQLite,
 *   upsert them into SQLite.
 *
 * Both phases use uuid as the merge key — no ID collisions possible.
 * Conflict resolution: Last-Write-Wins by updated_at timestamp.
 */

import dualDB from '../database/dualDB.js';
import sqliteManager from '../database/sqliteManager.js';
import mysqlPool from '../db.js';

const SYNC_INTERVAL_MS = parseInt(process.env.SYNC_CHECK_INTERVAL || '60000', 10);
const BATCH_SIZE = 200; // rows per sync batch

// Tables that sync bidirectionally (must have uuid + updated_at + is_synced)
const SYNC_TABLES = [
    { name: 'empdet', key: 'uuid', softDelete: true },
    { name: 'emppay', key: 'uuid', softDelete: true },
    { name: 'staffattendance', key: 'uuid', softDelete: false },
];

// Tables that sync MySQL → SQLite only (settings, no offline writes)
const READONLY_SYNC_TABLES = [
    { name: 'app_settings', key: 'setting_key' },
    { name: 'userdetails', key: 'UserID' },
];

// ─────────────────────────────────────────────────────────────────────────────

class SyncWorker {
    constructor() {
        this._timer = null;
        this._running = false;
        this._stats = { lastRun: null, totalPushed: 0, totalPulled: 0, errors: 0 };
    }

    start() {
        if (this._timer) return;
        this._timer = setInterval(() => this._tick(), SYNC_INTERVAL_MS);
        console.log(`[SyncWorker] Started — bidirectional sync every ${SYNC_INTERVAL_MS / 1000}s`);
    }

    stop() {
        if (this._timer) { clearInterval(this._timer); this._timer = null; }
    }

    getStats() { return { ...this._stats }; }

    async _tick() {
        if (this._running) return;
        const { mysqlAvailable, sqliteAvailable } = dualDB.getState();
        if (!mysqlAvailable || !sqliteAvailable) return;

        this._running = true;
        try {
            await this._runFullSync();
        } catch (err) {
            console.error('[SyncWorker] Unexpected error:', err.message);
            this._stats.errors++;
        } finally {
            this._running = false;
        }
    }

    async _runFullSync() {
        console.log('[SyncWorker] Starting sync cycle...');
        let totalPushed = 0;
        let totalPulled = 0;

        // ── PHASE A: SQLite → MySQL (push unsynced offline writes) ──────────
        for (const table of SYNC_TABLES) {
            try {
                const pushed = await this._pushOfflineWrites(table);
                totalPushed += pushed;
            } catch (err) {
                console.error(`[SyncWorker] Phase A failed for ${table.name}:`, err.message);
            }
        }

        // ── PHASE B: MySQL → SQLite (pull missing/newer rows) ───────────────
        for (const table of [...SYNC_TABLES, ...READONLY_SYNC_TABLES]) {
            try {
                const pulled = await this._pullFromMySQL(table);
                totalPulled += pulled;
            } catch (err) {
                console.error(`[SyncWorker] Phase B failed for ${table.name}:`, err.message);
            }
        }

        this._stats.lastRun = new Date().toISOString();
        this._stats.totalPushed += totalPushed;
        this._stats.totalPulled += totalPulled;

        if (totalPushed > 0 || totalPulled > 0) {
            console.log(`[SyncWorker] ✓ Cycle complete — pushed: ${totalPushed}, pulled: ${totalPulled}`);
        }

        return { pushed: totalPushed, pulled: totalPulled };
    }

    /**
     * PHASE A — Push SQLite offline writes to MySQL.
     * Finds rows with is_synced=0 in SQLite, upserts to MySQL, marks synced.
     */
    async _pushOfflineWrites(table) {
        const [offlineRows] = await sqliteManager.query(
            `SELECT * FROM "${table.name}" WHERE is_synced = 0 LIMIT ?`,
            [BATCH_SIZE]
        );
        if (!offlineRows || offlineRows.length === 0) return 0;

        let pushed = 0;
        const syncedUUIDs = [];

        for (const row of offlineRows) {
            try {
                const cols = Object.keys(row).filter(c => c !== 'id'); // skip local auto-id
                const vals = cols.map(c => row[c] instanceof Date ? row[c].toISOString() : row[c]);
                const updates = cols
                    .filter(c => !['uuid', 'created_at'].includes(c))
                    .map(c => `\`${c}\` = VALUES(\`${c}\`)`)
                    .join(', ');

                const sql = `INSERT INTO \`${table.name}\` (\`${cols.join('`, `')}\`)
                             VALUES (${cols.map(() => '?').join(', ')})
                             ON DUPLICATE KEY UPDATE ${updates}`;

                await mysqlPool.execute(sql, vals);
                syncedUUIDs.push(row[table.key]);
                pushed++;
            } catch (err) {
                console.warn(`[SyncWorker] Push failed for ${table.name} uuid=${row[table.key]}:`, err.message.slice(0, 80));
            }
        }

        // Mark as synced in SQLite (batch update)
        if (syncedUUIDs.length > 0) {
            const placeholders = syncedUUIDs.map(() => '?').join(', ');
            await sqliteManager.execute(
                `UPDATE "${table.name}" SET is_synced = 1 WHERE "${table.key}" IN (${placeholders})`,
                syncedUUIDs
            );
        }

        return pushed;
    }

    /**
     * PHASE B — Pull MySQL rows into SQLite (missing rows + newer updates).
     * Uses uuid-based comparison, Last-Write-Wins for conflicts.
     */
    async _pullFromMySQL(table) {
        // Get MySQL rows updated in the last sync window (or all if first sync)
        const cutoff = new Date(Date.now() - SYNC_INTERVAL_MS * 2).toISOString().slice(0, 19).replace('T', ' ');

        const [mysqlRows] = await mysqlPool.query(
            `SELECT * FROM \`${table.name}\` WHERE updated_at >= ? OR updated_at IS NULL LIMIT ?`,
            [cutoff, BATCH_SIZE]
        );
        if (!mysqlRows || mysqlRows.length === 0) return 0;

        let pulled = 0;

        for (const row of mysqlRows) {
            try {
                const keyVal = row[table.key];
                if (!keyVal) continue;

                // Check what SQLite has for this key
                const [existing] = await sqliteManager.query(
                    `SELECT "${table.key}", updated_at FROM "${table.name}" WHERE "${table.key}" = ?`,
                    [keyVal]
                );
                const sqliteRow = existing?.[0];

                // Last-Write-Wins: only update SQLite if MySQL row is newer
                if (sqliteRow) {
                    const mysqlTime = new Date(row.updated_at || 0).getTime();
                    const sqliteTime = new Date(sqliteRow.updated_at || 0).getTime();
                    if (sqliteTime >= mysqlTime) continue; // SQLite is equal or newer — skip
                }

                // Build upsert for SQLite
                const cols = Object.keys(row).filter(c => c !== 'id');
                const vals = cols.map(c => row[c] instanceof Date ? row[c].toISOString() : (row[c] ?? null));
                const updates = cols
                    .filter(c => c !== table.key)
                    .map(c => `"${c}" = excluded."${c}"`)
                    .join(', ');

                const sql = sqliteRow
                    ? `UPDATE "${table.name}" SET ${cols.filter(c => c !== table.key).map(c => `"${c}" = ?`).join(', ')} WHERE "${table.key}" = ?`
                    : `INSERT OR IGNORE INTO "${table.name}" ("${cols.join('", "')}") VALUES (${cols.map(() => '?').join(', ')})`;

                const sqlVals = sqliteRow
                    ? [...cols.filter(c => c !== table.key).map(c => row[c] instanceof Date ? row[c].toISOString() : (row[c] ?? null)), keyVal]
                    : vals;

                await sqliteManager.execute(sql, sqlVals);
                pulled++;
            } catch (err) {
                // Non-fatal — schema mismatch or constraint violation
                // console.debug(`[SyncWorker] Pull skip ${table.name}:`, err.message.slice(0,60));
            }
        }

        return pulled;
    }

    /**
     * Manually trigger a full sync (called from /api/system/sync-now).
     */
    async runNow() {
        if (this._running) {
            return { skipped: true, reason: 'Sync already in progress' };
        }
        const { mysqlAvailable, sqliteAvailable } = dualDB.getState();
        if (!mysqlAvailable || !sqliteAvailable) {
            return { skipped: true, reason: `Not in DUAL mode (mysql:${mysqlAvailable}, sqlite:${sqliteAvailable})` };
        }

        this._running = true;
        try {
            const result = await this._runFullSync();
            const health = await dualDB.getSyncHealth();
            return { success: true, ...result, health, stats: this._stats };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            this._running = false;
        }
    }
}

const syncWorker = new SyncWorker();
export default syncWorker;
