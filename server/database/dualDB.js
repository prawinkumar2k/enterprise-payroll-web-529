/**
 * DualDB — Refactored for SINGLE-TENANT Mode
 *
 * This version removes all company-based partitioning and dynamic pool switching.
 * It provides a unified API for the simplified payroll_system database.
 */

import mysqlPool from '../db.js';
import { randomUUID } from 'crypto';

const state = {
    mysqlAvailable: true,
    sqliteAvailable: false,
    initialized: true,
};

function _sanitizeParams(params) {
    if (!params) return [];
    const arr = Array.isArray(params) ? params : [params];
    return arr.map(p => {
        if (p instanceof Date) return p.toISOString().slice(0, 19).replace('T', ' ');
        if (p === undefined) return null;
        return p;
    });
}

/**
 * Execute a query on the unified database.
 */
async function query(sql, params = []) {
    try {
        const [rows] = await mysqlPool.query(sql, _sanitizeParams(params));
        return [rows ?? [], []];
    } catch (err) {
        console.error('[DualDB] Query error:', err.message, '| SQL:', sql);
        throw err;
    }
}

/**
 * Execute a statement on the unified database.
 */
async function execute(sql, params = []) {
    try {
        const [result] = await mysqlPool.execute(sql, _sanitizeParams(params));
        return { insertId: result.insertId, affectedRows: result.affectedRows };
    } catch (err) {
        console.error('[DualDB] Execute error:', err.message, '| SQL:', sql);
        throw err;
    }
}

/**
 * Execute a transaction on the unified database.
 */
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
        throw err;
    }
}

/**
 * Universal Upsert for single-tenant mode.
 */
async function upsert(table, data) {
    if (!data.uuid) data.uuid = randomUUID();
    const cols = Object.keys(data);
    const placeholders = cols.map(() => '?').join(', ');
    const updates = cols.filter(c => c !== 'uuid' && c !== 'id').map(c => `${c} = VALUES(${c})`).join(', ');
    const sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updates}`;
    await execute(sql, Object.values(data));
    return { action: 'processed', uuid: data.uuid };
}

export default {
    init: async () => {}, // No-op
    query,
    execute,
    transaction,
    upsert,
    getState: () => ({ ...state }),
    generateUUID: () => randomUUID(),
    ensureUUID: (data, field = 'uuid') => {
        if (!data[field]) data[field] = randomUUID();
        return data;
    },
    getConnection: async () => mysqlPool.getConnection(),
    exec: (sql) => execute(sql, []),
};
