import { describe, it, expect } from 'vitest';
import { salaryReducer, initialSalaryState } from '../../reducers/salaryReducer';

const ROW_A = { id: 1, EMPNO: 'E001', PAY: 5000, NETSAL: 4800 };
const ROW_B = { id: 2, EMPNO: 'E002', PAY: 6000, NETSAL: 5700 };

describe('salaryReducer', () => {
    it('returns same state for unknown action', () => {
        expect(salaryReducer(initialSalaryState, { type: '@@INIT' })).toBe(initialSalaryState);
    });

    it('SET_FIELD updates a single field', () => {
        const next = salaryReducer(initialSalaryState, {
            type: 'SET_FIELD', field: 'month', value: '03'
        });
        expect(next.month).toBe('03');
        expect(next.year).toBe(initialSalaryState.year);
    });

    it('SET_SALARY_DATA stores data and clears isLoading', () => {
        const loading = { ...initialSalaryState, isLoading: true };
        const next = salaryReducer(loading, { type: 'SET_SALARY_DATA', data: [ROW_A, ROW_B] });
        expect(next.salaryData).toEqual([ROW_A, ROW_B]);
        expect(next.isLoading).toBe(false);
    });

    it('UPDATE_SALARY_ROW replaces a row by id and clears editingRow', () => {
        const withRows = { ...initialSalaryState, salaryData: [ROW_A, ROW_B], editingRow: 1 };
        const updated = { ...ROW_A, PAY: 5500, NETSAL: 5200 };
        const next = salaryReducer(withRows, { type: 'UPDATE_SALARY_ROW', row: updated });
        expect(next.salaryData[0]).toEqual(updated);
        expect(next.salaryData[1]).toBe(ROW_B);
        expect(next.editingRow).toBeNull();
    });

    it('UPDATE_SALARY_ROW does not affect rows with different id', () => {
        const withRows = { ...initialSalaryState, salaryData: [ROW_A, ROW_B] };
        const updated = { ...ROW_A, PAY: 9999 };
        const next = salaryReducer(withRows, { type: 'UPDATE_SALARY_ROW', row: updated });
        expect(next.salaryData[1]).toStrictEqual(ROW_B);
    });

    it('PATCH_CELL updates a single cell on a specific row', () => {
        const withRows = { ...initialSalaryState, salaryData: [ROW_A, ROW_B] };
        const next = salaryReducer(withRows, {
            type: 'PATCH_CELL', rowId: 2, key: 'PAY', value: 6500
        });
        expect(next.salaryData[1].PAY).toBe(6500);
        expect(next.salaryData[0].PAY).toBe(5000);   // ROW_A untouched
    });

    it('is a pure function — does not mutate original state', () => {
        const withRows = Object.freeze({
            ...initialSalaryState,
            salaryData: Object.freeze([Object.freeze({ ...ROW_A })])
        });
        expect(() => salaryReducer(withRows, { type: 'PATCH_CELL', rowId: 1, key: 'PAY', value: 1 })).not.toThrow();
    });
});
