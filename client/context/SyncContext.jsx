
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { getApiUrl } from '../lib/api';
import syncService from '../lib/SyncService';

const SyncContext = createContext();

export const SYNC_MODES = {
    ONLINE: 'ONLINE',
    OFFLINE: 'OFFLINE',
    SYNCING: 'SYNCING',
    DUAL: 'DUAL',
};

export function SyncProvider({ children }) {
    const [mode, setMode] = useState(SYNC_MODES.ONLINE);
    const [lastSync, setLastSync] = useState(localStorage.getItem('last_successful_sync'));
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [error, setError] = useState(null);

    // Progress State
    const [progress, setProgress] = useState({
        stage: null, // pushing | pulling | verifying | finalizing
        current: 0,
        total: 0,
        percent: 0
    });

    const pollTimer = useRef(null);

    const fetchStatus = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get(getApiUrl('/sync/status'), {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                // Backend is the authority
                const backendMode = response.data.mode || SYNC_MODES.ONLINE;
                if (backendMode === SYNC_MODES.SYNCING && !isSyncing) {
                    setIsSyncing(true);
                } else if (backendMode !== SYNC_MODES.SYNCING && isSyncing && !syncService.isSyncing) {
                    setIsSyncing(false);
                }

                setMode(backendMode);
                setLastSync(response.data.lastSyncTime);
            }

            // Check local pending count
            const count = await syncService.getPendingCount();
            setPendingCount(count);

        } catch (err) {
            const status = err?.response?.status;
            if (status === 401 || status === 403) return; // Not authenticated — skip silently
            if (status >= 500) {
                setMode(SYNC_MODES.OFFLINE); // Server error = treat as offline
                return;
            }
            if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
                setMode(SYNC_MODES.OFFLINE);
                return;
            }
        }

        // Secondary: get precise DB mode from /api/system/sync-status
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const sysRes = await axios.get(getApiUrl('/system/sync-status'), {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 3000
            });
            if (sysRes.data?.mode) {
                setMode(sysRes.data.mode); // DUAL, OFFLINE, MYSQL_ONLY etc
            }
        } catch {
            // Non-fatal — sync status from /sync/status is sufficient fallback
        }
    }, [isSyncing]);

    // Smart Polling Strategy
    useEffect(() => {
        const getPollInterval = () => {
            if (isSyncing) return 3000;   // 3s during sync
            if (mode === SYNC_MODES.OFFLINE) return 10000; // 10s if offline
            return 30000; // 30s default online
        };

        const runPoll = async () => {
            await fetchStatus();
            pollTimer.current = setTimeout(runPoll, getPollInterval());
        };

        runPoll();
        return () => clearTimeout(pollTimer.current);
    }, [fetchStatus, mode, isSyncing]);

    const triggerManualSync = async () => {
        if (isSyncing) return;

        setIsSyncing(true);
        setError(null);
        setProgress({ stage: 'starting', current: 0, total: 1, percent: 5 });

        try {
            await syncService.performManualSync((p) => {
                setProgress(p);
            });
            await fetchStatus();
            setProgress({ stage: 'completed', current: 1, total: 1, percent: 100 });
            setTimeout(() => setProgress({ stage: null, current: 0, total: 0, percent: 0 }), 3000);
        } catch (err) {
            setError(err.message || 'Sync failed');
            setIsSyncing(false);
            setProgress({ stage: null, current: 0, total: 0, percent: 0 });
        } finally {
            // isSyncing will be updated by poll or finalized here if poll hasn't run
            setTimeout(() => setIsSyncing(syncService.isSyncing), 500);
        }
    };

    return (
        <SyncContext.Provider value={{
            mode,
            lastSync,
            isSyncing,
            progress,
            pendingCount,
            error,
            triggerManualSync,
            refreshStatus: fetchStatus
        }}>
            {children}
        </SyncContext.Provider>
    );
}

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) throw new Error('useSync must be used within a SyncProvider');
    return context;
};
