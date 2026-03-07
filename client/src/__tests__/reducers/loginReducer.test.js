import { describe, it, expect } from 'vitest';
import { loginReducer, initialLoginState } from '../../reducers/loginReducer';

describe('loginReducer', () => {
    it('returns the same state for unknown actions', () => {
        const state = loginReducer(initialLoginState, { type: 'UNKNOWN' });
        expect(state).toBe(initialLoginState);
    });

    it('SET_FIELD updates a single field', () => {
        const state = loginReducer(initialLoginState, {
            type: 'SET_FIELD', field: 'userId', value: 'admin'
        });
        expect(state.userId).toBe('admin');
        expect(state.password).toBe('');         // other fields unchanged
    });

    it('SET_FIELD for showPassword toggles correctly', () => {
        const state = loginReducer(initialLoginState, {
            type: 'SET_FIELD', field: 'showPassword', value: true
        });
        expect(state.showPassword).toBe(true);
    });

    it('SUBMIT_START sets isLoading=true and clears error', () => {
        const stateWithError = { ...initialLoginState, error: 'Bad credentials', isLoading: false };
        const state = loginReducer(stateWithError, { type: 'SUBMIT_START' });
        expect(state.isLoading).toBe(true);
        expect(state.error).toBe('');
    });

    it('SUBMIT_ERROR sets isLoading=false and records error', () => {
        const loading = { ...initialLoginState, isLoading: true };
        const state = loginReducer(loading, { type: 'SUBMIT_ERROR', error: 'Invalid password' });
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Invalid password');
    });

    it('is a pure function — does not mutate the original state', () => {
        const frozen = Object.freeze({ ...initialLoginState });
        expect(() => loginReducer(frozen, { type: 'SUBMIT_START' })).not.toThrow();
    });
});
