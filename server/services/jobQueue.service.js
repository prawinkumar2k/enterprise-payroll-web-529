/**
 * jobQueue.service.js — Background Job Processing Engine
 *
 * Runs heavy operations (payroll generation, report export, bulk import)
 * in the background so the API responds immediately (202 Accepted).
 *
 * Pattern:
 *   1. POST /api/salary/generate  → enqueue job → return { jobId }  (instant)
 *   2. GET  /api/jobs/:jobId      → poll status  → { status, progress, result }
 *   3. Frontend polls every 1s until status = 'done' | 'failed'
 *
 * No Redis / external dependencies needed for up to ~10 concurrent jobs.
 * Scale to BullMQ + Redis when you hit 50+ concurrent users.
 */

import { randomUUID } from 'crypto';

// ─── Job Status Enum ──────────────────────────────────────────────────────────
export const JOB_STATUS = {
    PENDING: 'pending',
    RUNNING: 'running',
    DONE: 'done',
    FAILED: 'failed',
};

// ─── In-Memory Job Store ──────────────────────────────────────────────────────
// Jobs expire after 30 minutes to prevent memory leaks
const jobs = new Map();
const JOB_TTL_MS = 30 * 60 * 1000;

// ─── Handlers Registry ───────────────────────────────────────────────────────
const handlers = new Map();

// ─── Queue State ──────────────────────────────────────────────────────────────
let processing = false;
const queue = [];

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register a job handler by type.
 * @param {string} type  e.g. 'GENERATE_PAYROLL'
 * @param {Function} fn  async (payload, updateProgress) => result
 */
export function registerHandler(type, fn) {
    handlers.set(type, fn);
}

/**
 * Enqueue a new job.
 * @param {string} type     handler type key
 * @param {object} payload  data passed to handler
 * @param {object} meta     { userId, username } for audit
 * @returns {string} jobId
 */
export function enqueue(type, payload, meta = {}) {
    if (!handlers.has(type)) {
        throw new Error(`No handler registered for job type: ${type}`);
    }

    const jobId = randomUUID();
    const job = {
        id: jobId,
        type,
        payload,
        meta,
        status: JOB_STATUS.PENDING,
        progress: 0,
        message: 'Queued...',
        result: null,
        error: null,
        createdAt: Date.now(),
        startedAt: null,
        doneAt: null,
    };

    jobs.set(jobId, job);
    queue.push(jobId);

    console.log(`[JobQueue] Enqueued ${type} job ${jobId.slice(0, 8)}...`);
    _processNext();

    return jobId;
}

/**
 * Get a job's current status snapshot.
 */
export function getJob(jobId) {
    return jobs.get(jobId) || null;
}

/**
 * List all active (pending/running) jobs.
 */
export function getActiveJobs() {
    return [...jobs.values()].filter(j =>
        j.status === JOB_STATUS.PENDING || j.status === JOB_STATUS.RUNNING
    );
}

// ─── Internal Processing ─────────────────────────────────────────────────────

async function _processNext() {
    if (processing || queue.length === 0) return;
    processing = true;

    const jobId = queue.shift();
    const job = jobs.get(jobId);

    if (!job) { processing = false; _processNext(); return; }

    job.status = JOB_STATUS.RUNNING;
    job.startedAt = Date.now();
    job.message = 'Processing...';

    const updateProgress = (pct, msg) => {
        job.progress = Math.min(100, Math.max(0, pct));
        job.message = msg || job.message;
    };

    try {
        const handler = handlers.get(job.type);
        job.result = await handler(job.payload, updateProgress, job.meta);
        job.status = JOB_STATUS.DONE;
        job.progress = 100;
        job.message = 'Completed successfully.';
        console.log(`[JobQueue] ✓ Job ${job.type} ${jobId.slice(0, 8)} done in ${Date.now() - job.startedAt}ms`);
    } catch (err) {
        job.status = JOB_STATUS.FAILED;
        job.error = err.message || 'Unknown error';
        job.message = `Failed: ${job.error}`;
        console.error(`[JobQueue] ✗ Job ${job.type} ${jobId.slice(0, 8)} failed:`, err.message);
    } finally {
        job.doneAt = Date.now();
        processing = false;
        // Schedule cleanup after TTL
        setTimeout(() => jobs.delete(jobId), JOB_TTL_MS);
        // Process next job in queue
        _processNext();
    }
}

// ─── Express Route Handlers ──────────────────────────────────────────────────

/**
 * GET /api/jobs/:jobId
 * Returns current job status. Frontend polls this every 1s.
 */
export function jobStatusHandler(req, res) {
    const job = getJob(req.params.jobId);
    if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found or expired.' });
    }
    res.json({
        success: true,
        job: {
            id: job.id,
            type: job.type,
            status: job.status,
            progress: job.progress,
            message: job.message,
            result: job.status === JOB_STATUS.DONE ? job.result : null,
            error: job.status === JOB_STATUS.FAILED ? job.error : null,
        }
    });
}

export default { registerHandler, enqueue, getJob, getActiveJobs, jobStatusHandler, JOB_STATUS };
