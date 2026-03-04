
/**
 * SyncWorker — MySQL-Only Mode (No-Op)
 *
 * Since the system now runs on MySQL only (no SQLite),
 * the bidirectional sync engine is no longer needed.
 * This module is kept as a no-op stub so existing imports don't break.
 */

class SyncWorker {
    constructor() {
        this._stats = { lastRun: null, totalPushed: 0, totalPulled: 0, errors: 0 };
    }

    start() {
        console.log('[SyncWorker] MySQL-only mode — sync worker disabled (not needed).');
    }

    stop() {
        // No-op
    }

    getStats() {
        return { ...this._stats };
    }

    async runNow() {
        return {
            skipped: true,
            reason: 'MySQL-only mode — no sync needed',
            stats: this._stats,
        };
    }
}

const syncWorker = new SyncWorker();
export default syncWorker;
