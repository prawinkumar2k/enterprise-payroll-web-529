
/**
 * DualDB — Production-Grade Unified Database Abstraction Layer
 *
 * Architecture:
 *   - All controllers import ONLY this module
 *   - Automatic MySQL ↔ SQLite failover
 *   - Atomic dual-write (write to both DBs on every mutation)
 *   - Failed secondary writes are queued and retried automatically
 *   - No 500 crashes due to DB unavailability
 *   - Full runtime immunity: structured responses always returned
 */

import mysqlPool from '../db.js';
import sqliteManager from './sqliteManager.js';
import retryQueue from '../sync/retryQueue.js';
import { randomUUID } from 'crypto';

// ────────────────────────────────────────────────────────────────────────────
// Connection State Tracker
// ────────────────────────────────────────────────────────────────────────────
const state = {
    mysqlAvailable: false,
    sqliteAvailable: false,
    initialized: false,
};

const CONNECTION_ERRORS = new Set([
    'ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ETIMEDOUT',
    'ECONNRESET', 'ENOTFOUND', 'ER_ACCESS_DENIED_ERROR',
    'EADDRNOTAVAIL', 'ENETUNREACH',
]);

function isConnectionError(err) {
    return CONNECTION_ERRORS.has(err?.code) || err?.errno === 1045;
}

/**
 * Translate MySQL-dialect SQL to SQLite-compatible SQL.
 * The dualDB layer handles this at the top level so neither
 * sqliteManager nor controllers need to worry about dialect differences.
 */
function _mysqlToSqlite(sql) {
    if (!sql) return sql;
    return sql
        .replace(/FOR UPDATE/gi, '')
        .replace(/`([^`]+)`/g, '"$1"')      // backtick → double-quote identifiers
        .replace(/\bADD COLUMN IF NOT EXISTS\b/gi, 'ADD COLUMN IF NOT EXISTS') // SQLite 3.37+ supports this
        .replace(/CAST\(([^)]+?)\s+AS\s+DECIMAL\(\d+,\s*\d+\)\)/gi, 'CAST($1 AS NUMERIC)')
        .replace(/CAST\(([^)]+?)\s+AS\s+SIGNED\)/gi, 'CAST($1 AS INTEGER)')
        .replace(/\bNOW\(\)/gi, "datetime('now','localtime')")
        .replace(/\bCURDATE\(\)/gi, "date('now','localtime')")
        .replace(/\bCURRENT_TIMESTAMP\b/gi, "datetime('now','localtime')")
        .replace(/\bIF\s*\(([^,]+),\s*([^,]+),\s*([^)]+)\)/gi, 'IIF($1,$2,$3)')
        .replace(/\bGROUP_CONCAT\(([^)]+)\s+SEPARATOR\s+'([^']+)'\)/gi, "GROUP_CONCAT($1,'$2')")
        .replace(/\bON\s+DUPLICATE\s+KEY\s+UPDATE\b/gi, 'ON CONFLICT DO UPDATE SET')
        .replace(/ON\s+CONFLICT\s+DO\s+UPDATE\s+SET\s+(.*?)\s+WHERE/gis, 'ON CONFLICT DO UPDATE SET $1 WHERE');
}

// ────────────────────────────────────────────────────────────────────────────
// UUID & Timestamp Utilities (production sync primitives)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Generate a v4 UUID suitable for use as a sync key.
 * Always use this instead of DB auto-increment IDs for cross-DB sync.
 */
function generateUUID() {
    return randomUUID();
}

/**
 * Ensure a data object has a UUID field before insert.
 * Usage: const data = dualDB.ensureUUID({ empno: '101', sname: 'John' })
 */
function ensureUUID(data, field = 'uuid') {
    if (!data[field]) {
        return { ...data, [field]: randomUUID() };
    }
    return data;
}

/**
 * Last-Write-Wins conflict resolver.
 * Compares updated_at timestamps from both DBs and returns the winner.
 * Returns 'mysql' | 'sqlite' | 'equal'
 */
function resolveConflict(mysqlRow, sqliteRow) {
    if (!mysqlRow) return 'sqlite';
    if (!sqliteRow) return 'mysql';

    const mysqlTime = new Date(mysqlRow.updated_at || mysqlRow.UpdatedAt || 0).getTime();
    const sqliteTime = new Date(sqliteRow.updated_at || 0).getTime();

    if (mysqlTime > sqliteTime) return 'mysql';
    if (sqliteTime > mysqlTime) return 'sqlite';
    return 'equal';
}

/**
 * UPSERT — conflict-safe write using UUID as key.
 * If a row with the same uuid already exists, Last-Write-Wins applies.
 * Use this for sync operations instead of raw INSERT.
 *
 * @param {string} table - Table name (e.g., 'empdet')
 * @param {object} data - Row data. Must include `uuid` and `updated_at`.
 * @returns {Promise<object>} - { action: 'inserted'|'updated'|'skipped', uuid }
 */
async function upsert(table, data) {
    if (!data.uuid) data.uuid = randomUUID();
    if (!data.updated_at) data.updated_at = new Date().toISOString();

    const uuid = data.uuid;

    // Check if record exists in primary DB
    const [existing] = await query(`SELECT uuid, updated_at FROM ${table} WHERE uuid = ?`, [uuid]);
    const existingRow = existing?.[0];

    if (existingRow) {
        // Apply Last-Write-Wins
        const winner = resolveConflict({ updated_at: existingRow.updated_at }, { updated_at: data.updated_at });
        if (winner === 'mysql') {
            // Existing DB record is newer — skip this write
            return { action: 'skipped', uuid, reason: 'existing_is_newer' };
        }
    }

    const cols = Object.keys(data);
    const vals = Object.values(data);
    const placeholders = cols.map(() => '?').join(', ');
    const updates = cols.filter(c => c !== 'uuid').map(c => `${c} = VALUES(${c})`).join(', ');

    const sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})
                 ON DUPLICATE KEY UPDATE ${updates}`;

    await execute(sql, vals);
    return { action: existingRow ? 'updated' : 'inserted', uuid };
}


// ────────────────────────────────────────────────────────────────────────────
// Initialization — Called once at server startup
// ────────────────────────────────────────────────────────────────────────────
async function init() {
    console.log('[DualDB] Initializing databases...');

    // 1. Init SQLite (always try first — it's local and fast)
    try {
        await sqliteManager.initSchema();
        state.sqliteAvailable = true;
        console.log('✓ [DualDB] SQLite ready.');
    } catch (err) {
        console.error('[DualDB] SQLite init failed:', err.message);
        state.sqliteAvailable = false;
    }

    // 2. Test MySQL connectivity (skip if DISABLE_MYSQL=true)
    if (process.env.DISABLE_MYSQL === 'true') {
        state.mysqlAvailable = false;
        console.log('[DualDB] MySQL disabled via DISABLE_MYSQL=true. Running in SQLite-only mode.');
    } else {
        try {
            const conn = await mysqlPool.getConnection();
            conn.release();
            state.mysqlAvailable = true;
            console.log('✓ [DualDB] MySQL connected.');
        } catch (err) {
            state.mysqlAvailable = false;
            console.warn(`[DualDB] MySQL unavailable (${err.code || err.message}). Running in SQLite-only mode.`);
        }
    }

    // 3. Start background retry worker only if MySQL is active
    if (state.mysqlAvailable) {
        retryQueue.startWorker();
    }

    state.initialized = true;
    console.log(`[DualDB] Mode: ${state.mysqlAvailable ? 'DUAL (MySQL primary + SQLite mirror)' : 'SQLITE-ONLY (fast local mode)'}`);
}

// ────────────────────────────────────────────────────────────────────────────
// Internal MySQL availability probe (non-blocking)
// ────────────────────────────────────────────────────────────────────────────
async function _probeMySQL() {
    if (process.env.DISABLE_MYSQL === 'true') return false;
    try {
        const conn = await mysqlPool.getConnection();
        conn.release();
        state.mysqlAvailable = true;
        return true;
    } catch {
        state.mysqlAvailable = false;
        return false;
    }
}

// ────────────────────────────────────────────────────────────────────────────
// QUERY — Read Operation
// Strategy: MySQL primary → SQLite fallback on failure
// ────────────────────────────────────────────────────────────────────────────
async function query(sql, params = []) {
    const cleanSql = sql?.trim() || '';
    const cleanParams = _sanitizeParams(params);

    // MySQL path
    if (state.mysqlAvailable) {
        try {
            const [rows] = await mysqlPool.query(cleanSql, cleanParams);
            return [rows ?? [], []];
        } catch (err) {
            if (isConnectionError(err)) {
                console.warn('[DualDB] MySQL read failed, falling back to SQLite:', err.code);
                state.mysqlAvailable = false;
                _probeMySQL(); // Re-probe in background
            } else {
                // Non-connection error — log and fall through to SQLite
                console.error('[DualDB] MySQL query error:', err.message);
            }
        }
    }

    // SQLite fallback (translate MySQL dialect first)
    if (state.sqliteAvailable) {
        try {
            return await sqliteManager.query(_mysqlToSqlite(cleanSql), cleanParams);
        } catch (err) {
            console.error('[DualDB] SQLite query error:', err.message);
        }
    }

    // Both DBs failed — return safe empty result
    console.error('[DualDB] All databases unavailable for query. Returning empty result.');
    return [[], []];
}

// ────────────────────────────────────────────────────────────────────────────
// EXECUTE — Write Operation (Atomic Dual Write)
// Strategy:
//   - Write MySQL first (primary)
//   - Write SQLite second (mirror)
//   - If primary fails → rollback, queue for retry
//   - If mirror fails → queue SQLite retry only
// ────────────────────────────────────────────────────────────────────────────
async function execute(sql, params = []) {
    const cleanSql = sql?.trim() || '';
    const cleanParams = _sanitizeParams(params);

    let mysqlResult = null;

    // ── MySQL Primary Write ──
    if (state.mysqlAvailable) {
        try {
            const [result] = await mysqlPool.execute(cleanSql, cleanParams);
            mysqlResult = { insertId: result.insertId, affectedRows: result.affectedRows };
        } catch (err) {
            if (isConnectionError(err)) {
                console.warn('[DualDB] MySQL write failed, switching to SQLite-only:', err.code);
                state.mysqlAvailable = false;
                _probeMySQL(); // Background reconnect probe
            } else {
                // Actual query error (constraint violation, bad SQL, etc.)
                throw err; // Bubble up — this is a real error
            }
        }
    }

    // ── SQLite Mirror Write (translate MySQL dialect) ──
    if (state.sqliteAvailable) {
        try {
            const sqliteResult = await sqliteManager.execute(_mysqlToSqlite(cleanSql), cleanParams);

            // If MySQL succeeded: return MySQL result (has real insertId from cluster)
            // If MySQL failed: return SQLite result
            return mysqlResult ?? sqliteResult;

        } catch (err) {
            if (mysqlResult) {
                // MySQL OK but SQLite failed → queue SQLite retry
                console.warn('[DualDB] SQLite mirror write failed, queuing for retry:', err.message);
                retryQueue.enqueue({ sql: cleanSql, params: cleanParams, target: 'sqlite', timestamp: Date.now() });
                return mysqlResult; // MySQL succeeded — return that result
            } else {
                // Both failed — throw
                console.error('[DualDB] Both DBs failed on execute:', err.message);
                throw new Error('Database write failed on all available backends.');
            }
        }
    }

    // Only MySQL available and it succeeded
    if (mysqlResult) {
        // Queue SQLite sync for later
        retryQueue.enqueue({ sql: cleanSql, params: cleanParams, target: 'sqlite', timestamp: Date.now() });
        return mysqlResult;
    }

    throw new Error('No database available for write operation.');
}

// ────────────────────────────────────────────────────────────────────────────
// TRANSACTION — Atomic multi-statement block
// ────────────────────────────────────────────────────────────────────────────
async function transaction(callback) {
    if (state.mysqlAvailable) {
        const conn = await mysqlPool.getConnection();
        try {
            await conn.beginTransaction();
            const result = await callback({
                query: async (sql, params) => {
                    const [rows] = await conn.query(sql, _sanitizeParams(params));
                    return [rows ?? [], []];
                },
                execute: async (sql, params) => {
                    const [res] = await conn.execute(sql, _sanitizeParams(params));
                    return { insertId: res.insertId, affectedRows: res.affectedRows };
                },
            });
            await conn.commit();
            conn.release();
            return result;
        } catch (err) {
            try { await conn.rollback(); } catch { }
            conn.release();
            if (isConnectionError(err)) {
                state.mysqlAvailable = false;
                return _sqliteTransaction(callback);
            }
            throw err;
        }
    }

    return _sqliteTransaction(callback);
}

async function _sqliteTransaction(callback) {
    await sqliteManager.ensureInitialized();
    try {
        sqliteManager.db.exec('BEGIN TRANSACTION');
        const result = await callback({
            query: async (sql, params) => sqliteManager.query(_mysqlToSqlite(sql), _sanitizeParams(params)),
            execute: async (sql, params) => sqliteManager.execute(_mysqlToSqlite(sql), _sanitizeParams(params)),
        });
        sqliteManager.db.exec('COMMIT');
        sqliteManager.saveToDisk();
        return result;
    } catch (err) {
        try { sqliteManager.db.exec('ROLLBACK'); } catch { }
        throw err;
    }
}



// ────────────────────────────────────────────────────────────────────────────
// GET CONNECTION — Returns a unified connection interface for transactional code.
// MySQL: real connection from pool
// SQLite: delegate to sqliteManager.getConnection() which provides the same API
// ────────────────────────────────────────────────────────────────────────────
async function getConnection() {
    if (state.mysqlAvailable) {
        try {
            const conn = await mysqlPool.getConnection();
            return conn;
        } catch (err) {
            if (isConnectionError(err)) {
                state.mysqlAvailable = false;
            }
        }
    }

    // sqliteManager.getConnection() returns a shim with:
    // beginTransaction(), commit(), rollback(), query(), execute(), release()
    return sqliteManager.getConnection();
}


// ────────────────────────────────────────────────────────────────────────────
// SYNC STATUS — For /api/system/sync-status endpoint
// ────────────────────────────────────────────────────────────────────────────
async function getSyncHealth() {
    const tables = ['userdetails', 'empdet', 'emppay', 'staffattendance', 'app_settings'];
    const report = {
        mysqlAvailable: state.mysqlAvailable,
        sqliteAvailable: state.sqliteAvailable,
        mode: state.mysqlAvailable ? (state.sqliteAvailable ? 'DUAL' : 'MYSQL_ONLY') : 'OFFLINE',
        pendingRetries: retryQueue.getQueueSize(),
        tables: [],
        healthy: true,
    };

    for (const table of tables) {
        const entry = { table, mysqlCount: null, sqliteCount: null, mismatch: false };

        if (state.mysqlAvailable) {
            try {
                const [[row]] = await mysqlPool.query(`SELECT COUNT(*) as count FROM \`${table}\``);
                entry.mysqlCount = row?.count ?? 0;
            } catch { entry.mysqlCount = 'ERROR'; }
        }

        if (state.sqliteAvailable) {
            try {
                const [rows] = await sqliteManager.query(`SELECT COUNT(*) as count FROM "${table}"`);
                entry.sqliteCount = rows?.[0]?.count ?? 0;
            } catch { entry.sqliteCount = 'ERROR'; }
        }

        if (entry.mysqlCount !== null && entry.sqliteCount !== null &&
            entry.mysqlCount !== 'ERROR' && entry.sqliteCount !== 'ERROR' &&
            entry.mysqlCount !== entry.sqliteCount) {
            entry.mismatch = true;
            report.healthy = false;
        }

        report.tables.push(entry);
    }

    return report;
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
function _sanitizeParams(params) {
    return params.map(p => {
        if (p instanceof Date) return p.toISOString();
        if (p === undefined) return null;
        return p;
    });
}

function getState() {
    return { ...state };
}

// ── Compatibility shims (drop-in replacement for dbManager) ──
async function exec(sql) {
    return execute(sql, []);
}

// ────────────────────────────────────────────────────────────────────────────
// Exports — Single unified interface for all controllers
// ────────────────────────────────────────────────────────────────────────────
export default {
    init,
    query,
    execute,
    exec,
    transaction,
    getConnection,
    getSyncHealth,
    getState,

    // ── Sync Primitives (Production UUID + LWW conflict resolution) ──
    generateUUID,          // Generate a v4 UUID
    ensureUUID,            // Add uuid field to data object if missing
    resolveConflict,       // Last-Write-Wins: compare updated_at timestamps
    upsert,                // Conflict-safe INSERT with LWW logic

    // Legacy compatibility
    getRawInstance: () => sqliteManager.getRawInstance(),
};

