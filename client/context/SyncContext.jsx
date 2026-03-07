
import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { getApiUrl } from '../lib/api';
import syncService from '../lib/SyncService';

const SyncContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const SYNC_MODES = {
    ONLINE: 'ONLINE',
    OFFLINE: 'OFFLINE',
    SYNCING: 'SYNCING'
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
                    dispatch({ type: 'SET_FIELD', field: 'isSyncing', value: true });
                } else if (backendMode !== SYNC_MODES.SYNCING && isSyncing && !syncService.isSyncing) {
                    dispatch({ type: 'SET_FIELD', field: 'isSyncing', value: false });
                }

                dispatch({ type: 'SET_FIELD', field: 'mode', value: backendMode });
                dispatch({ type: 'SET_FIELD', field: 'lastSync', value: response.data.lastSyncTime });
            }

            // Check local pending count
            const count = await syncService.getPendingCount();
            dispatch({ type: 'SET_FIELD', field: 'pendingCount', value: count });

        } catch (err) {
            console.error('[SyncContext] Poll failed:', err.message);
            if (err.code === 'ERR_NETWORK') {
                dispatch({ type: 'SET_FIELD', field: 'mode', value: SYNC_MODES.OFFLINE });
            }
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
            // isSyncing will be updated by poll or finalized here if poll hasn't run
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
