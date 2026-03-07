import { describe, it, expect } from 'vitest';
import { usersReducer, initialUsersState, emptyFormData } from '../../reducers/usersReducer';

const EXISTING_USER = {
    UserID: 'U001', UserName: 'alice', Password: 'hashed', Role: 'admin',
    Department: 'HR', Qualification: 'MBA', Contact: '9876543210', Remark: ''
};

describe('usersReducer', () => {
    it('returns same state for unknown action', () => {
        expect(usersReducer(initialUsersState, { type: '@@INIT' })).toBe(initialUsersState);
    });

    it('SET_FIELD updates a top-level field', () => {
        const next = usersReducer(initialUsersState, {
            type: 'SET_FIELD', field: 'searchTerm', value: 'alice'
        });
        expect(next.searchTerm).toBe('alice');
        expect(next.loading).toBe(initialUsersState.loading);
    });

    it('SET_FORM_FIELD updates a single nested formData field', () => {
        const next = usersReducer(initialUsersState, {
            type: 'SET_FORM_FIELD', field: 'UserName', value: 'bob'
        });
        expect(next.formData.UserName).toBe('bob');
        expect(next.formData.Role).toBe('');    // other formData fields unchanged
    });

    it('OPEN_MODAL for new user opens modal with empty formData', () => {
        const next = usersReducer(initialUsersState, {
            type: 'OPEN_MODAL', user: null, viewMode: false
        });
        expect(next.isModalOpen).toBe(true);
        expect(next.currentUser).toBeNull();
        expect(next.viewMode).toBe(false);
        expect(next.formData).toEqual(emptyFormData);
    });

    it('OPEN_MODAL for existing user populates formData and clears password', () => {
        const next = usersReducer(initialUsersState, {
            type: 'OPEN_MODAL', user: EXISTING_USER, viewMode: false
        });
        expect(next.isModalOpen).toBe(true);
        expect(next.currentUser).toBe(EXISTING_USER);
        expect(next.formData.UserID).toBe('U001');
        expect(next.formData.Password).toBe('');   // password cleared for security
        expect(next.formData.Role).toBe('admin');
    });

    it('OPEN_MODAL with viewMode=true sets viewMode flag', () => {
        const next = usersReducer(initialUsersState, {
            type: 'OPEN_MODAL', user: EXISTING_USER, viewMode: true
        });
        expect(next.viewMode).toBe(true);
    });

    it('CLOSE_MODAL resets modal state', () => {
        const open = {
            ...initialUsersState, isModalOpen: true,
            currentUser: EXISTING_USER, viewMode: true
        };
        const next = usersReducer(open, { type: 'CLOSE_MODAL' });
        expect(next.isModalOpen).toBe(false);
        expect(next.currentUser).toBeNull();
        expect(next.viewMode).toBe(false);
    });

    it('is a pure function — does not mutate original state', () => {
        const frozen = Object.freeze({ ...initialUsersState, formData: Object.freeze({ ...emptyFormData }) });
        expect(() => usersReducer(frozen, { type: 'SET_FORM_FIELD', field: 'UserName', value: 'x' })).not.toThrow();
    });
});
