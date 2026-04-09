import Redis from 'ioredis';

// ─── TTL Constants (milliseconds) ────────────────────────────────────────────
export const TTL = {
    DASHBOARD: 60,    // 1 minute (Seconds for Redis)
    SUMMARY: 300,    // 5 minutes
    EMPLOYEES: 120,    // 2 minutes
    REPORTS: 600,    // 10 minutes
    SETTINGS: 300,    // 5 minutes
    SHORT: 30,    // 30 seconds
};

// ─── Internal Store ───────────────────────────────────────────────────────────
const memStore = new Map();
let redis = null;

if (process.env.REDIS_URL) {
    try {
        redis = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 1,
            retryStrategy: () => null // Disable retry for failover to memory
        });
        redis.on('error', (err) => {
            console.warn('[Cache] Redis Error — Falling back to Memory');
            redis = null;
        });
        console.log('[Cache] Distributed Redis initialized.');
    } catch (e) {
        console.warn('[Cache] Redis initialization failed — using local memory only.');
    }
}

let _hits = 0;
let _misses = 0;

// ─── Auto-cleanup (Memory only) ─────────────────────
setInterval(() => {
    if (redis) return;
    const now = Date.now();
    for (const [key, entry] of memStore.entries()) {
        if (now > entry.expiresAt) { memStore.delete(key); }
    }
}, 300_000);

/**
 * Get a cached value.
 */
export async function get(key) {
    if (redis) {
        try {
            const data = await redis.get(key);
            if (data) { _hits++; return JSON.parse(data); }
        } catch (e) { redis = null; } // Fallback on error
    }

    const entry = memStore.get(key);
    if (!entry) { _misses++; return null; }
    if (Date.now() > entry.expiresAt) { memStore.delete(key); _misses++; return null; }
    _hits++;
    return entry.data;
}

/**
 * Set a value with a TTL.
 */
export async function set(key, data, ttlSeconds = TTL.DASHBOARD) {
    if (redis) {
        try {
            await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
            return;
        } catch (e) { redis = null; }
    }
    memStore.set(key, { data, expiresAt: Date.now() + (ttlSeconds * 1000) });
}

/**
 * Invalidate by prefix.
 */
export async function invalidate(prefix) {
    if (redis) {
        try {
            const keys = await redis.keys(prefix + '*');
            if (keys.length) await redis.del(...keys);
            return keys.length;
        } catch (e) { redis = null; }
    }

    let count = 0;
    for (const key of memStore.keys()) {
        if (key.startsWith(prefix)) { memStore.delete(key); count++; }
    }
    return count;
}

/**
 * Cache stats.
 */
export function stats() {
    return {
        mode: redis ? 'Redis (Distributed)' : 'In-Memory (Local)',
        hits: _hits,
        misses: _misses,
    };
}

/**
 * Wrap logic.
 */
export async function wrap(key, ttl, fn) {
    const cached = await get(key);
    if (cached !== null) return cached;
    const data = await fn();
    await set(key, data, ttl);
    return data;
}

export default { get, set, invalidate, stats, wrap, TTL };

