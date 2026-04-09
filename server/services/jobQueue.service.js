import { randomUUID } from 'crypto';
import db from '../database/dbManager.js';
import Redis from 'ioredis';
import logger from '../utils/logger.js';

let redisInstance = null;
let useRedis = false;

// Graceful Redis Connection
const initRedis = () => {
    try {
        const r = new Redis({
            host: process.env.REDIS_HOST || '127.0.0.1',
            maxRetriesPerRequest: 1, // Fail fast to use DB fallback
            enableReadyCheck: false,
            retryStrategy: () => null // Disable auto-retry for fallback logic
        });
        r.on('error', (err) => {
            if (useRedis) {
                logger.warn({ message: 'Redis Down. Falling back to DB Queue.', error: err.message, module: 'REDIS' });
                useRedis = false;
            }
        });
        r.on('connect', () => { 
            useRedis = true; 
            logger.info({ message: 'Cloud Redis Linked.', module: 'REDIS' });
        });
        redisInstance = r;
    } catch (e) {
        logger.warn('Failed to initialize Redis client. Using local DB persistence only.');
    }
};

initRedis();

const QUEUE_KEY = 'payroll:job:queue';
export const JOB_STATUS = { PENDING: 'PENDING', RUNNING: 'RUNNING', DONE: 'DONE', FAILED: 'FAILED' };
const handlers = new Map();

export function registerHandler(type, fn) { handlers.set(type, fn); }

export async function enqueue(type, payload, meta = {}) {
    if (!handlers.has(type)) throw new Error(`Handler not found: ${type}`);
    const jobId = randomUUID();
    
    // Always persist to DB for history & fallback
    await db.execute('INSERT INTO system_jobs (id, type, payload, status) VALUES (?, ?, ?, ?)', [jobId, type, JSON.stringify(payload), JOB_STATUS.PENDING]);
    
    if (useRedis && redisInstance) {
        try {
            await redisInstance.lpush(QUEUE_KEY, JSON.stringify({ jobId, type, payload, meta }));
            logger.info({ message: 'Job enqueued (Cloud Redis)', jobId, type });
        } catch (e) {
            useRedis = false;
            logger.warn('Redis push failed. Relying on DB polling.');
        }
    } else {
        logger.info({ message: 'Job enqueued (Local DB Persistence)', jobId, type });
        _startDbWorker(); // Fallback to DB polling worker
    }
    return jobId;
}

export async function getJob(jobId) {
    const [rows] = await db.query('SELECT * FROM system_jobs WHERE id = ?', [jobId]);
    return rows ? rows[0] : null;
}

/** ── DB Worker (Fallback/Single-Instance) ── **/
let dbWorkerRunning = false;
async function _startDbWorker() {
    if (dbWorkerRunning || useRedis) return;
    dbWorkerRunning = true;
    while (!useRedis) {
        try {
            const [rows] = await db.query('SELECT * FROM system_jobs WHERE status = ? ORDER BY created_at ASC LIMIT 1', [JOB_STATUS.PENDING]);
            if (!rows.length) break;
            await _processJob(rows[0].id, rows[0].type, JSON.parse(rows[0].payload), {});
        } catch (err) { break; }
    }
    dbWorkerRunning = false;
}

/** ── Redis Distributed Worker ── **/
export async function startWorker() {
    logger.info({ message: 'Initializing Distributed Cloud Worker...', module: 'WORKER' });
    while (true) {
        if (!useRedis) { await new Promise(r => setTimeout(r, 5000)); _startDbWorker(); continue; }
        try {
            const res = await redisInstance.brpop(QUEUE_KEY, 5);
            if (!res) continue;
            const { jobId, type, payload, meta } = JSON.parse(res[1]);
            await _processJob(jobId, type, payload, meta);
        } catch (err) { await new Promise(r => setTimeout(r, 1000)); }
    }
}

async function _processJob(jobId, type, payload, meta) {
    await db.execute('UPDATE system_jobs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [JOB_STATUS.RUNNING, jobId]);
    const handler = handlers.get(type);
    const updateProgress = async (pct) => await db.execute('UPDATE system_jobs SET progress = ? WHERE id = ?', [Math.min(100, pct), jobId]);
    try {
        const out = await handler(payload, updateProgress, meta);
        await db.execute('UPDATE system_jobs SET status = ?, progress = 100, result = ? WHERE id = ?', [JOB_STATUS.DONE, JSON.stringify(out || {}), jobId]);
    } catch (err) {
        const [rows] = await db.query('SELECT attempts FROM system_jobs WHERE id = ?', [jobId]);
        const attempts = (rows[0]?.attempts || 0) + 1;
        if (attempts < 3) {
            await db.execute('UPDATE system_jobs SET attempts = ?, status = "PENDING" WHERE id = ?', [attempts, jobId]);
            if (useRedis) await redisInstance.lpush(QUEUE_KEY, JSON.stringify({ jobId, type, payload, meta }));
        } else {
            await db.execute('UPDATE system_jobs SET status = "FAILED", error = ? WHERE id = ?', [err.message, jobId]);
        }
    }
}

export async function jobStatusHandler(req, res) {
    const job = await getJob(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    res.json({ success: true, job });
}

export default { registerHandler, enqueue, getJob, jobStatusHandler, startWorker, JOB_STATUS };