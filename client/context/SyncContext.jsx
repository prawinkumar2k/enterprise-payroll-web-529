import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { getApiUrl } from '../lib/apiClient';
import syncService from '../lib/SyncService';

const SyncContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const SYNC_MODES = {
    ONLINE: 'ONLINE',
    OFFLINE: 'OFFLINE',
    SYNCING: 'SYNCING',
    DUAL: 'DUAL',
};

function syncReducer(state, action) {
    switch (action.type) {
        case 'SET_FIELD': return { ...state, [action.field]: action.value };
        default: return state;
    }
}

export function SyncProvider({ children }) {
    const [state, dispatch] = useReducer(syncReducer, {
        mode: SYNC_MODES.ONLINE,
        lastSync: localStorage.getItem('last_successful_sync'),
        isSyncing: false,
        pendingCount: 0,
        error: null,
        progress: { stage: null, current: 0, total: 0, percent: 0 }
    });
    const { mode, lastSync, isSyncing, pendingCount, error, progress } = state;

    // ── Refs track latest state without causing effect re-runs ────────────────
    const pollTimer = useRef(null);
    const isSyncingRef = useRef(isSyncing);
    const modeRef = useRef(mode);
    const isDestroyedRef = useRef(false);

    // Keep refs in sync with state (these effects do NOT trigger the poll loop)
    useEffect(() => { isSyncingRef.current = isSyncing; }, [isSyncing]);
    useEffect(() => { modeRef.current = mode; }, [mode]);

    // ── Fetch sync status from the server ─────────────────────────────────────
    const fetchStatus = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return; // Not logged in — skip silently

            const response = await axios.get(getApiUrl('/sync/status'), {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000,
            });

            if (response.data.success) {
                const backendMode = response.data.mode || SYNC_MODES.ONLINE;

                if (backendMode === SYNC_MODES.SYNCING && !isSyncingRef.current) {
                    dispatch({ type: 'SET_FIELD', field: 'isSyncing', value: true });
                } else if (backendMode !== SYNC_MODES.SYNCING && isSyncingRef.current && !syncService.isSyncing) {
                    dispatch({ type: 'SET_FIELD', field: 'isSyncing', value: false });
                }

                dispatch({ type: 'SET_FIELD', field: 'mode', value: backendMode });
                dispatch({ type: 'SET_FIELD', field: 'lastSync', value: response.data.lastSyncTime });
            }

            // Check local pending queue count
            const count = await syncService.getPendingCount();
            dispatch({ type: 'SET_FIELD', field: 'pendingCount', value: count });

        } catch (err) {
            const status = err?.response?.status;

            // Silently skip auth errors (user is not logged in yet)
            if (status === 401 || status === 403) return;

            // Mark OFFLINE for network-level errors
            if (!status || err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
                dispatch({ type: 'SET_FIELD', field: 'mode', value: SYNC_MODES.OFFLINE });
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
                dispatch({ type: 'SET_FIELD', field: 'mode', value: sysRes.data.mode });
            }
        } catch {
            // Non-fatal — secondary endpoint is optional
        }
    }, []); // Stable: uses refs only, no state deps

    // ── Self-contained polling loop ───────────────────────────────────────────
    // CRITICAL: This effect has NO state dependencies ([] only).
    // It runs ONCE on mount and cleans up on unmount.
    // State changes (mode, isSyncing) do NOT restart this loop —
    // they are read via refs at schedule time so the loop stays stable.
    useEffect(() => {
        isDestroyedRef.current = false;

        const getPollInterval = () => {
            if (isSyncingRef.current) return 3000;          // 3s while syncing
            if (modeRef.current === SYNC_MODES.OFFLINE) return 30000; // 30s if offline
            return 60000;                                    // 60s normal online
        };

        const runPoll = async () => {
            if (isDestroyedRef.current) return; // Component unmounted — bail out
            await fetchStatus();
            if (isDestroyedRef.current) return; // Check again after async work
            pollTimer.current = setTimeout(runPoll, getPollInterval());
        };

        // Start the polling loop
        runPoll();

        return () => {
            isDestroyedRef.current = true;
            clearTimeout(pollTimer.current);
        };
    }, [fetchStatus]); // fetchStatus is stable (useCallback with [])

    // ── Manual Sync Trigger ───────────────────────────────────────────────────
    const triggerManualSync = async () => {
        if (isSyncing) return;

        dispatch({ type: 'SET_FIELD', field: 'isSyncing', value: true });
        dispatch({ type: 'SET_FIELD', field: 'error', value: null });
        dispatch({ type: 'SET_FIELD', field: 'progress', value: { stage: 'starting', current: 0, total: 1, percent: 5 } });

        try {
            await syncService.performManualSync((p) => {
                dispatch({ type: 'SET_FIELD', field: 'progress', value: p });
            });
            await fetchStatus();
            dispatch({ type: 'SET_FIELD', field: 'progress', value: { stage: 'completed', current: 1, total: 1, percent: 100 } });
            setTimeout(() => dispatch({ type: 'SET_FIELD', field: 'progress', value: { stage: null, current: 0, total: 0, percent: 0 } }), 3000);
        } catch (err) {
            dispatch({ type: 'SET_FIELD', field: 'error', value: err.message || 'Sync failed' });
            dispatch({ type: 'SET_FIELD', field: 'isSyncing', value: false });
            dispatch({ type: 'SET_FIELD', field: 'progress', value: { stage: null, current: 0, total: 0, percent: 0 } });
        } finally {
            setTimeout(() => dispatch({ type: 'SET_FIELD', field: 'isSyncing', value: syncService.isSyncing }), 500);
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

// eslint-disable-next-line react-refresh/only-export-components
export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) throw new Error('useSync must be used within a SyncProvider');
    return context;
};
