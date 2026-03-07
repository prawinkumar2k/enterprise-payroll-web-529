import { describe, it, expect } from 'vitest';
import { auditLogsReducer, initialAuditState } from '../../reducers/auditLogsReducer';

describe('auditLogsReducer', () => {
    it('returns same state for unknown action', () => {
        expect(auditLogsReducer(initialAuditState, { type: '@@INIT' })).toBe(initialAuditState);
    });

    it('SET_FIELD updates arbitrary field', () => {
        const next = auditLogsReducer(initialAuditState, {
            type: 'SET_FIELD', field: 'filtersOpen', value: true
        });
        expect(next.filtersOpen).toBe(true);
        expect(next.loading).toBe(true);           // everything else intact
    });

    it('SET_LOGS stores logs and clears loading/error', () => {
        const loading = { ...initialAuditState, loading: true, error: 'prev error' };
        const logs = [{ id: 1, action: 'LOGIN' }, { id: 2, action: 'UPDATE' }];
        const next = auditLogsReducer(loading, { type: 'SET_LOGS', logs });
        expect(next.logs).toEqual(logs);
        expect(next.loading).toBe(false);
        expect(next.error).toBe('');
    });

    it('SET_ERROR records error and clears loading', () => {
        const loading = { ...initialAuditState, loading: true };
        const next = auditLogsReducer(loading, { type: 'SET_ERROR', error: 'API timeout' });
        expect(next.error).toBe('API timeout');
        expect(next.loading).toBe(false);
    });

    it('SET_LOADING toggles loading flag', () => {
        const next = auditLogsReducer(initialAuditState, { type: 'SET_LOADING', value: false });
        expect(next.loading).toBe(false);
    });

    it('CLEAR_FILTERS resets all five filter fields', () => {
        const withFilters = {
            ...initialAuditState,
            userNameFilter: 'alice',
            roleFilter: 'admin',
            actionFilter: 'LOGIN',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
        };
        const next = auditLogsReducer(withFilters, { type: 'CLEAR_FILTERS' });
        expect(next.userNameFilter).toBe('');
        expect(next.roleFilter).toBe('');
        expect(next.actionFilter).toBe('');
        expect(next.startDate).toBe('');
        expect(next.endDate).toBe('');
        // Non-filter fields are preserved
        expect(next.logs).toBe(withFilters.logs);
    });

    it('is a pure function — does not mutate original state', () => {
        const frozen = Object.freeze({ ...initialAuditState, logs: Object.freeze([]) });
        expect(() => auditLogsReducer(frozen, { type: 'CLEAR_FILTERS' })).not.toThrow();
    });
});
