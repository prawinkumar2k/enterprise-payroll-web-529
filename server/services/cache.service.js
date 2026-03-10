/**
 * cache.service.js — In-Memory Cache Layer
 *
 * Zero-dependency, production-safe TTL cache.
 * Replaces repeated DB hits for dashboard KPIs, monthly summaries,
 * and employee lists with sub-millisecond in-memory responses.
 *
 * Usage:
 *   import cache from './cache.service.js';
 *   const data = cache.get('dashboard:kpis:02-2026');
 *   cache.set('dashboard:kpis:02-2026', data, cache.TTL.DASHBOARD);
 *   cache.invalidate('dashboard:');  // flush all dashboard keys
 */

// ─── TTL Constants (milliseconds) ────────────────────────────────────────────
export const TTL = {
    DASHBOARD: 60_000,    //  1 minute  — KPIs & payroll summaries
    SUMMARY: 300_000,    //  5 minutes — monthly attendance summaries
    EMPLOYEES: 120_000,    //  2 minutes — employee list
    REPORTS: 600_000,    // 10 minutes — generated reports
    SETTINGS: 300_000,    //  5 minutes — app settings
    SHORT: 30_000,    // 30 seconds — rapidly changing data
};

// ─── Internal Store ───────────────────────────────────────────────────────────
const store = new Map();
let _hits = 0;
let _misses = 0;

// ─── Auto-cleanup: sweep expired entries every 5 minutes ─────────────────────
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of store.entries()) {
        if (now > entry.expiresAt) { store.delete(key); cleaned++; }
    }
    if (cleaned > 0) console.log(`[Cache] Swept ${cleaned} expired entries. Size: ${store.size}`);
}, 300_000);

// ─── Core API ─────────────────────────────────────────────────────────────────

/**
 * Get a cached value. Returns null on miss or expiry.
 */
export function get(key) {
    const entry = store.get(key);
    if (!entry) { _misses++; return null; }
    if (Date.now() > entry.expiresAt) { store.delete(key); _misses++; return null; }
    _hits++;
    return entry.data;
}

/**
 * Set a value with a TTL.
 * @param {string} key
 * @param {*} data
 * @param {number} ttl  milliseconds (use TTL constants above)
 */
export function set(key, data, ttl = TTL.DASHBOARD) {
    store.set(key, { data, expiresAt: Date.now() + ttl });
}

/**
 * Delete all cache entries whose key starts with a given prefix.
 * e.g. invalidate('dashboard:') clears all dashboard keys.
 */
export function invalidate(prefix) {
    let count = 0;
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) { store.delete(key); count++; }
    }
    if (count > 0) console.log(`[Cache] Invalidated ${count} keys matching "${prefix}*"`);
    return count;
}

/**
 * Delete a single key.
 */
export function del(key) {
    return store.delete(key);
}

/**
 * Clear everything.
 */
export function flush() {
    const size = store.size;
    store.clear();
    console.log(`[Cache] Flushed all ${size} entries.`);
}

/**
 * Cache stats for /api/health endpoint.
 */
export function stats() {
    const total = _hits + _misses;
    return {
        size: store.size,
        hits: _hits,
        misses: _misses,
        hitRate: total > 0 ? `${(((_hits / total) * 100)).toFixed(1)}%` : 'N/A',
    };
}

/**
 * Wrap an async function with cache.
 * If cached → return immediately.
 * If not → call fn(), cache the result, return it.
 *
 * @example
 * const data = await cache.wrap('key', TTL.DASHBOARD, () => dbManager.query(...));
 */
export async function wrap(key, ttl, fn) {
    const cached = get(key);
    if (cached !== null) return cached;
    const data = await fn();
    set(key, data, ttl);
    return data;
}

export default { get, set, invalidate, del, flush, stats, wrap, TTL };
