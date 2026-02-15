
import dns from 'dns';

export const MODES = {
    OFFLINE: 'OFFLINE',
    ONLINE: 'ONLINE',
    SYNCING: 'SYNCING'
};

class ModeManager {
    constructor() {
        this.isDesktop = process.env.IS_DESKTOP === 'true';
        this.currentMode = this.isDesktop ? MODES.OFFLINE : MODES.ONLINE;
        this.isOnline = !this.isDesktop;
        this.checkInterval = 30000; // 30 seconds
        this.isSyncing = false;
        this.syncTimeout = null;
    }

    async init() {
        if (!this.isDesktop) {
            await this.checkConnectivity();
            this.startMonitoring();
        } else {
            console.log('[ModeManager] Running in Desktop Mode. Online checks disabled.');
            this._updateMode();
        }
    }

    async checkConnectivity() {
        if (this.isDesktop) {
            this.isOnline = false;
            this._updateMode();
            return false;
        }
        return new Promise((resolve) => {
            dns.lookup('google.com', (err) => {
                if (err && err.code === 'ENOTFOUND') {
                    this.isOnline = false;
                    this._updateMode();
                    resolve(false);
                } else {
                    this.isOnline = true;
                    this._updateMode();
                    resolve(true);
                }
            });
        });
    }

    startMonitoring() {
        setInterval(() => this.checkConnectivity(), this.checkInterval);
    }

    setSyncing(status) {
        this.isSyncing = status;
        if (status) {
            // Heartbeat/Fail-safe: Reset SYNCING mode after 5 minutes of inactivity if it gets stuck
            if (this.syncTimeout) clearTimeout(this.syncTimeout);
            this.syncTimeout = setTimeout(() => {
                if (this.isSyncing) {
                    console.warn('[ModeManager] Sync timeout reached. Auto-resetting to ONLINE.');
                    this.isSyncing = false;
                    this._updateMode();
                }
            }, 5 * 60 * 1000); // 5 minutes
        } else {
            if (this.syncTimeout) clearTimeout(this.syncTimeout);
        }
        this._updateMode();
    }

    /**
     * Emergency manual reset for sync mode
     */
    resetSyncMode() {
        if (this.syncTimeout) clearTimeout(this.syncTimeout);
        this.isSyncing = false;
        this._updateMode();
        console.log('[ModeManager] Sync mode manually reset.');
    }

    _updateMode() {
        if (this.isSyncing) {
            this.currentMode = MODES.SYNCING;
        } else if (this.isOnline) {
            this.currentMode = MODES.ONLINE;
        } else {
            this.currentMode = MODES.OFFLINE;
        }
        // console.log(`[ModeManager] Mode set to: ${this.currentMode}`);
    }

    getMode() {
        return this.currentMode;
    }

    isOffline() {
        return this.currentMode === MODES.OFFLINE;
    }
}

const modeManager = new ModeManager();
export default modeManager;
