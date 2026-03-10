
/**
 * DualDB — MySQL-Only Database Abstraction Layer (Production)
 *
 * Architecture:
 *   - All controllers import ONLY this module (via dbManager.js re-export)
 *   - MySQL is the sole database backend
 *   - Automatic reconnection on connection loss
 *   - Full runtime immunity: structured responses always returned
 *   - Compatible API surface — no controller changes needed
 */

import mysqlPool from '../db.js';
import { randomUUID } from 'crypto';

// ────────────────────────────────────────────────────────────────────────────
// Connection State Tracker
// ────────────────────────────────────────────────────────────────────────────
const state = {
    mysqlAvailable: false,
    sqliteAvailable: false,  // Always false — kept for API compatibility
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

// ────────────────────────────────────────────────────────────────────────────
// UUID & Timestamp Utilities (production sync primitives)
// ────────────────────────────────────────────────────────────────────────────

function generateUUID() {
    return randomUUID();
}

function ensureUUID(data, field = 'uuid') {
    if (!data[field]) {
        return { ...data, [field]: randomUUID() };
    }
    return data;
}

function resolveConflict(rowA, rowB) {
    if (!rowA) return 'B';
    if (!rowB) return 'A';
    const timeA = new Date(rowA.updated_at || 0).getTime();
    const timeB = new Date(rowB.updated_at || 0).getTime();
    if (timeA > timeB) return 'A';
    if (timeB > timeA) return 'B';
    return 'equal';
}

/**
 * UPSERT — conflict-safe write using UUID as key.
 */
async function upsert(table, data) {
    if (!data.uuid) data.uuid = randomUUID();
    if (!data.updated_at) data.updated_at = new Date().toISOString();

    const uuid = data.uuid;

    const [existing] = await query(`SELECT uuid, updated_at FROM ${table} WHERE uuid = ?`, [uuid]);
    const existingRow = existing?.[0];

    if (existingRow) {
        const winner = resolveConflict({ updated_at: existingRow.updated_at }, { updated_at: data.updated_at });
        if (winner === 'A') {
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
    console.log('[DualDB] Initializing MySQL database...');

    // Test MySQL connectivity
    try {
        const conn = await mysqlPool.getConnection();
        conn.release();
        state.mysqlAvailable = true;
        console.log('✓ [DualDB] MySQL connected successfully.');
    } catch (err) {
        state.mysqlAvailable = false;
        console.error(`[DualDB] MySQL connection FAILED: ${err.code || err.message}`);
        console.error('[DualDB] Server will retry MySQL on each request.');
        // Start background reconnection probe
        _startReconnectProbe();
    }

    state.initialized = true;
    console.log(`[DualDB] Mode: MYSQL_ONLY (Production)`);
}

// ────────────────────────────────────────────────────────────────────────────
// Background MySQL reconnection probe
// ────────────────────────────────────────────────────────────────────────────
let _reconnectTimer = null;

function _startReconnectProbe() {
    if (_reconnectTimer) return;
    _reconnectTimer = setInterval(async () => {
        if (state.mysqlAvailable) {
            clearInterval(_reconnectTimer);
            _reconnectTimer = null;
            return;
        }
        try {
            const conn = await mysqlPool.getConnection();
            conn.release();
            state.mysqlAvailable = true;
            console.log('✓ [DualDB] MySQL reconnected!');
            clearInterval(_reconnectTimer);
            _reconnectTimer = null;
        } catch {
            // Still down — keep probing
        }
    }, 10000); // Probe every 10 seconds
}

async function _probeMySQL() {
    try {
        const conn = await mysqlPool.getConnection();
        conn.release();
        state.mysqlAvailable = true;
        return true;
    } catch {
        state.mysqlAvailable = false;
        _startReconnectProbe();
        return false;
    }
}

// ────────────────────────────────────────────────────────────────────────────
// QUERY — Read Operation (MySQL only)
// ────────────────────────────────────────────────────────────────────────────
async function query(sql, params = []) {
    const cleanSql = sql?.trim() || '';
    const cleanParams = _sanitizeParams(params);

    if (!state.mysqlAvailable) {
        // Try a quick reconnect before failing
        const reconnected = await _probeMySQL();
        if (!reconnected) {
            console.error('[DualDB] MySQL unavailable for query. Returning empty result.');
            return [[], []];
        }
    }

    try {
        const [rows] = await mysqlPool.query(cleanSql, cleanParams);
        return [rows ?? [], []];
    } catch (err) {
        if (isConnectionError(err)) {
            console.warn('[DualDB] MySQL connection lost:', err.code);
            state.mysqlAvailable = false;
            _startReconnectProbe();
            return [[], []];
        }
        // Real query error — bubble up
        console.error('[DualDB] MySQL query error:', err.message);
        throw err;
    }
}

// ────────────────────────────────────────────────────────────────────────────
// EXECUTE — Write Operation (MySQL only)
// ────────────────────────────────────────────────────────────────────────────
async function execute(sql, params = []) {
    const cleanSql = sql?.trim() || '';
    const cleanParams = _sanitizeParams(params);

    if (!state.mysqlAvailable) {
        const reconnected = await _probeMySQL();
        if (!reconnected) {
            throw new Error('MySQL database unavailable for write operation.');
        }
    }

    try {
        const [result] = await mysqlPool.execute(cleanSql, cleanParams);
        return { insertId: result.insertId, affectedRows: result.affectedRows };
    } catch (err) {
        if (isConnectionError(err)) {
            console.warn('[DualDB] MySQL write connection lost:', err.code);
            state.mysqlAvailable = false;
            _startReconnectProbe();
            throw new Error('MySQL database connection lost during write.');
        }
        throw err; // Real error (constraint, bad SQL, etc.)
    }
}

// ────────────────────────────────────────────────────────────────────────────
// TRANSACTION — Atomic multi-statement block (MySQL only)
// ────────────────────────────────────────────────────────────────────────────
async function transaction(callback) {
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
            _startReconnectProbe();
        }
        throw err;
    }
}

// ────────────────────────────────────────────────────────────────────────────
// GET CONNECTION — Returns a MySQL connection from pool
// ────────────────────────────────────────────────────────────────────────────
async function getConnection() {
    try {
        const conn = await mysqlPool.getConnection();
        return conn;
    } catch (err) {
        if (isConnectionError(err)) {
            state.mysqlAvailable = false;
            _startReconnectProbe();
        }
        throw err;
    }
}


// ────────────────────────────────────────────────────────────────────────────
// SYNC STATUS — For /api/system/sync-status endpoint
// ────────────────────────────────────────────────────────────────────────────
async function getSyncHealth() {
    const tables = ['userdetails', 'empdet', 'emppay', 'staffattendance', 'app_settings'];
    const report = {
        mysqlAvailable: state.mysqlAvailable,
        sqliteAvailable: false,
        mode: state.mysqlAvailable ? 'MYSQL_ONLY' : 'OFFLINE',
        pendingRetries: 0,
        tables: [],
        healthy: state.mysqlAvailable,
    };

    for (const table of tables) {
        const entry = { table, mysqlCount: null, sqliteCount: null, mismatch: false };

        if (state.mysqlAvailable) {
            try {
                const [[row]] = await mysqlPool.query(`SELECT COUNT(*) as count FROM \`${table}\``);
                entry.mysqlCount = row?.count ?? 0;
            } catch { entry.mysqlCount = 'ERROR'; }
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

    // Sync Primitives
    generateUUID,
    ensureUUID,
    resolveConflict,
    upsert,

    // Legacy compatibility — returns null (no SQLite)
    getRawInstance: () => null,
};
