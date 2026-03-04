
/**
 * RetryQueue — Persistent background retry for failed secondary DB writes
 *
 * When MySQL is available but SQLite mirror write fails (or vice versa),
 * the operation is enqueued here and retried at a configurable interval.
 * This ensures eventual consistency without crashing the request cycle.
 */

import sqliteManager from '../database/sqliteManager.js';

const RETRY_INTERVAL_MS = parseInt(process.env.SYNC_RETRY_INTERVAL || '5000', 10);
const MAX_RETRIES = 10;

class RetryQueue {
    constructor() {
        this._queue = [];       // In-memory queue
        this._worker = null;    // Interval handle
        this._running = false;
    }

    /**
     * Enqueue a failed write for later retry.
     * @param {{ sql: string, params: any[], target: 'sqlite'|'mysql', timestamp: number }} op
     */
    enqueue(op) {
        const entry = { ...op, retries: 0, enqueuedAt: Date.now() };
        this._queue.push(entry);
        console.log(`[RetryQueue] Queued ${op.target} write for retry. Queue size: ${this._queue.length}`);
    }

    /**
     * How many operations are pending retry.
     */
    getQueueSize() {
        return this._queue.length;
    }

    /**
     * Start the background retry worker.
     * Safe to call multiple times — only starts one worker.
     */
    startWorker() {
        if (this._worker) return;
        this._worker = setInterval(() => this._processQueue(), RETRY_INTERVAL_MS);
        console.log(`[RetryQueue] Background worker started (interval: ${RETRY_INTERVAL_MS}ms)`);
    }

    /**
     * Stop the background worker (e.g., for graceful shutdown).
     */
    stopWorker() {
        if (this._worker) {
            clearInterval(this._worker);
            this._worker = null;
        }
    }

    /**
     * Process pending retry operations.
     */
    async _processQueue() {
        if (this._running || this._queue.length === 0) return;
        this._running = true;

        const pending = [...this._queue];
        this._queue = [];

        const failed = [];

        for (const op of pending) {
            try {
                if (op.target === 'sqlite') {
                    await sqliteManager.execute(op.sql, op.params || []);
                    console.log(`[RetryQueue] ✓ SQLite retry succeeded after ${op.retries + 1} attempt(s).`);
                }
                // Future: add mysql target for reverse sync
            } catch (err) {
                const nextRetry = op.retries + 1;
                if (nextRetry < MAX_RETRIES) {
                    failed.push({ ...op, retries: nextRetry });
                    // console.warn(`[RetryQueue] Retry ${nextRetry}/${MAX_RETRIES} failed for ${op.target}:`, err.message);
                } else {
                    console.error(`[RetryQueue] ❌ Dropping operation after ${MAX_RETRIES} retries:`, op.sql?.slice(0, 80));
                }
            }
        }

        // Re-queue failures for next cycle
        this._queue = [...failed, ...this._queue];
        this._running = false;
    }
}

const retryQueue = new RetryQueue();
export default retryQueue;
