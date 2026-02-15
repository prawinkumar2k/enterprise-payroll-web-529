
import axios from 'axios';
import { getApiUrl } from './api';

/**
 * SyncService - Client-side logic for Manual & Auto Synchronization
 * Hardened for Phase 4.1: Progress Tracking & Atomic Orchestration
 */
class SyncService {
    constructor() {
        this.deviceId = localStorage.getItem('device_id') || this._generateDeviceId();
        this.tables = ['empdet', 'emppay', 'staffattendance', 'userdetails', 'system_settings', 'app_settings', 'organization_settings'];
        this.maxRetries = 3;
        this.retryDelay = 2000;
        this.isSyncing = false;
        this.autoSyncInterval = 10 * 60 * 1000; // 10 minutes
        this._initAutoSync();
    }

    _generateDeviceId() {
        const id = 'DEV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        localStorage.setItem('device_id', id);
        return id;
    }

    _initAutoSync() {
        if (typeof window === 'undefined') return;

        window.addEventListener('online', () => {
            console.log('[SyncService] Network back online. Triggering sync...');
            this._debouncedSync();
        });

        setInterval(() => {
            this._debouncedSync();
        }, this.autoSyncInterval);
    }

    _debouncedSync() {
        if (this.isSyncing) return;
        this.performManualSync().catch(err => console.error('[SyncService] Auto-sync failed:', err));
    }

    /**
     * Start Sync Process with Granular Progress Callbacks
     */
    async performManualSync(onProgress) {
        if (this.isSyncing) return { success: false, message: 'Sync already in progress' };
        this.isSyncing = true;

        let attempts = 0;
        try {
            while (attempts < this.maxRetries) {
                try {
                    // Update: Progress Verification Stage
                    if (onProgress) onProgress({ stage: 'verifying', current: 0, total: 1, percent: 10 });

                    // 1. PUSH local changes to server
                    const pushResult = await this.pushLocalChanges((p) => {
                        if (onProgress) onProgress({ ...p, percent: Math.floor(10 + (p.percent * 0.4)) }); // Map 0-100 to 10-50
                    });

                    // 2. PULL server changes to local
                    const pullResult = await this.pullServerChanges((p) => {
                        if (onProgress) onProgress({ ...p, percent: Math.floor(50 + (p.percent * 0.4)) }); // Map 0-100 to 50-90
                    });

                    // 3. Finalize
                    if (onProgress) onProgress({ stage: 'finalizing', current: 1, total: 1, percent: 100 });

                    const serverTime = pullResult.last_sync_time;
                    localStorage.setItem('last_successful_sync', serverTime);
                    await this._acknowledgeSync(serverTime);

                    return { success: true, pushResult, pullResult };
                } catch (error) {
                    attempts++;
                    if (attempts === this.maxRetries) throw error;
                    const delay = this.retryDelay * Math.pow(2, attempts - 1);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * PUSH Logic with progress tracking
     */
    async pushLocalChanges(onProgress) {
        // Placeholder for local dirty row fetching
        // In reality, this would query the local DB
        const mockPendingRows = []; // To be replaced with actual local DB query
        const total = mockPendingRows.length || 1;

        if (onProgress) onProgress({ stage: 'pushing', current: 0, total, percent: 0 });

        const payload = {
            device_id: this.deviceId,
            tables: {} // Populate with actual dirty rows
        };

        const token = localStorage.getItem('token');
        const response = await axios.post(getApiUrl('/sync/push'), payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (onProgress) onProgress({ stage: 'pushing', current: total, total, percent: 100 });
        return response.data;
    }

    /**
     * PULL Logic with progress tracking
     */
    async pullServerChanges(onProgress) {
        const lastSync = localStorage.getItem('last_successful_sync') || '1970-01-01T00:00:00Z';
        const token = localStorage.getItem('token');

        if (onProgress) onProgress({ stage: 'pulling', current: 0, total: 1, percent: 0 });

        const response = await axios.get(getApiUrl('/sync/pull'), {
            params: {
                device_id: this.deviceId,
                since: lastSync
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
            const tables = response.data.tables || {};
            const tableNames = Object.keys(tables);
            const totalTables = tableNames.length || 1;

            for (let i = 0; i < tableNames.length; i++) {
                // Mocking per-table progress
                if (onProgress) onProgress({
                    stage: 'pulling',
                    current: i + 1,
                    total: totalTables,
                    percent: Math.floor(((i + 1) / totalTables) * 100)
                });
                // Actual integration: await this._applyTableUpdate(tableNames[i], tables[tableNames[i]]);
            }

            if (tableNames.length === 0 && onProgress) {
                onProgress({ stage: 'pulling', current: 1, total: 1, percent: 100 });
            }
        }

        return response.data;
    }

    /**
     * Get count of local unsynced changes
     */
    async getPendingCount() {
        // Placeholder: Query local SQLite for COUNT(*) WHERE is_synced = 0
        return 0;
    }

    async _acknowledgeSync(serverTime) {
        const token = localStorage.getItem('token');
        await axios.post(getApiUrl('/sync/status'), { last_sync_time: serverTime }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
}

export default new SyncService();
