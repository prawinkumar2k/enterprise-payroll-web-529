import dbManager from '../database/dbManager.js';
import { logAudit } from '../utils/auditLogger.js';
import { randomUUID } from 'crypto';

/**
 * Enterprise Cloud Sync Engine (Phase 2.5 - Hardened)
 * Implements idempotency, transaction atomicity, and clock-drift protection.
 */
class SyncService {
    constructor() {
        this.syncableTables = ['empdet', 'emppay', 'staffattendance', 'audit_logs'];
    }

    /**
     * PUSH: Client to Cloud
     * Generates a sync bundle and records a batch ledger entry.
     */
    async getPushBundle(lastSyncTime, tenantId = 'local') {
        const batchId = `PUSH_${randomUUID().substring(0, 8)}_${Date.now()}`;
        const payload = {};

        for (const table of this.syncableTables) {
            const [rows] = await dbManager.query(
                `SELECT * FROM ${table} WHERE (is_synced = 0 OR updated_at > ?) AND tenant_id = ?`,
                [lastSyncTime, tenantId]
            );
            if (rows.length > 0) payload[table] = rows;
        }

        const recordCount = Object.values(payload).reduce((acc, t) => acc + t.length, 0);

        // Record batch in ledger
        await dbManager.execute(`
            INSERT INTO sync_batches (batch_id, tenant_id, direction, status, record_count)
            VALUES (?, ?, 'PUSH', 'PENDING', ?)
        `, [batchId, tenantId, recordCount]);

        return {
            metadata: { batchId, tenantId, timestamp: new Date().toISOString(), recordCount },
            data: payload
        };
    }

    /**
     * PULL: Cloud to Client
     * Applies remote changes with replay protection and version-first conflict resolution.
     */
    async applyIncomingBundle(bundle, tenantId = 'local') {
        const { metadata, data } = bundle;
        const batchId = metadata.batchId || `PULL_${randomUUID().substring(0, 8)}`;

        // 1. Idempotency Check: Avoid re-processing the same batch
        const [existing] = await dbManager.query('SELECT status FROM sync_batches WHERE batch_id = ?', [batchId]);
        if (existing.length > 0 && existing[0].status === 'SUCCESS') {
            return { success: true, message: 'Batch already processed.', skipped: true };
        }

        const results = { applied: 0, conflicts: 0, errors: [] };
        const connection = await dbManager.getConnection();

        try {
            await connection.beginTransaction();

            // Record start of batch
            await connection.execute(`
                INSERT INTO sync_batches (batch_id, tenant_id, direction, status, record_count)
                VALUES (?, ?, 'PULL', 'PROCESSING', ?)
                ON CONFLICT(batch_id) DO UPDATE SET status = 'PROCESSING'
            `, [batchId, tenantId, metadata.recordCount || 0]);

            for (const [table, rows] of Object.entries(data)) {
                if (!this.syncableTables.includes(table)) continue;

                for (const row of rows) {
                    try {
                        const [localRows] = await connection.query(
                            `SELECT sync_version, updated_at FROM ${table} WHERE uuid = ? AND tenant_id = ?`,
                            [row.uuid, tenantId]
                        );

                        let action = 'INSERT';
                        if (localRows.length > 0) {
                            const local = localRows[0];

                            // CLOCK DRIFT PROTECTION: Prioritize sync_version over updated_at
                            const isIncomingVersionNewer = row.sync_version > local.sync_version;
                            const isSameVersionButNewerDate = (row.sync_version === local.sync_version) &&
                                (new Date(row.updated_at) > new Date(local.updated_at));

                            if (isIncomingVersionNewer || isSameVersionButNewerDate) {
                                await this._updateLocalRow(connection, table, row, tenantId);
                                action = 'UPDATE';
                                results.applied++;
                            } else {
                                results.conflicts++;
                                action = 'CONFLICT_IGNORED';
                                await this._logSyncTrail(connection, batchId, table, row.uuid, action, 'SUCCESS', tenantId);
                                continue;
                            }
                        } else {
                            await this._insertLocalRow(connection, table, row, tenantId);
                            results.applied++;
                        }

                        await this._logSyncTrail(connection, batchId, table, row.uuid, action, 'SUCCESS', tenantId);

                    } catch (e) {
                        results.errors.push({ uuid: row.uuid, message: e.message });
                        await this._logSyncTrail(connection, batchId, table, row.uuid, 'ERROR', 'FAILED', tenantId);
                    }
                }
            }

            // Mark batch as success
            await connection.execute(
                "UPDATE sync_batches SET status = 'SUCCESS', completed_at = CURRENT_TIMESTAMP WHERE batch_id = ?",
                [batchId]
            );

            await connection.commit();
            return { success: true, ...results, batchId };

        } catch (error) {
            await connection.rollback();
            await dbManager.execute(
                "UPDATE sync_batches SET status = 'FAILED', error_message = ? WHERE batch_id = ?",
                [error.message, batchId]
            );
            throw error;
        } finally {
            connection.release();
        }
    }

    async markAsSynced(batchId, uuidsByTable, tenantId = 'local') {
        const connection = await dbManager.getConnection();
        try {
            await connection.beginTransaction();
            for (const [table, uuids] of Object.entries(uuidsByTable)) {
                if (uuids.length === 0) continue;
                await connection.execute(
                    `UPDATE ${table} SET is_synced = 1 WHERE uuid IN (?) AND tenant_id = ?`,
                    [uuids, tenantId]
                );
            }
            await connection.execute(
                "UPDATE sync_batches SET status = 'SUCCESS', completed_at = CURRENT_TIMESTAMP WHERE batch_id = ?",
                [batchId]
            );
            await connection.commit();
        } catch (e) {
            await connection.rollback();
            throw e;
        } finally {
            connection.release();
        }
    }

    async _logSyncTrail(db, batchId, table, uuid, action, status, tenantId) {
        await db.execute(`
            INSERT INTO sync_audit_trail (batch_id, table_name, record_uuid, action, status, tenant_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [batchId, table, uuid, action, status, tenantId]);
    }

    async _insertLocalRow(db, table, row, tenantId) {
        const keys = Object.keys(row).filter(k => k !== 'id');
        const values = keys.map(k => row[k]);
        if (!keys.includes('tenant_id')) { keys.push('tenant_id'); values.push(tenantId); }

        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO ${table} (${keys.map(k => `\`${k}\``).join(', ')}) VALUES (${placeholders})`;
        await db.execute(sql, values);
    }

    async _updateLocalRow(db, table, row, tenantId) {
        const keys = Object.keys(row).filter(k => !['id', 'uuid', 'created_at'].includes(k));
        const values = keys.map(k => row[k]);
        const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
        const sql = `UPDATE ${table} SET ${setClause}, is_synced = 1 WHERE uuid = ? AND tenant_id = ?`;
        await db.execute(sql, [...values, row.uuid, tenantId]);
    }
}

export default new SyncService();
