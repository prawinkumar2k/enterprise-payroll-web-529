const now = new Date();
const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
const currentYear = String(now.getFullYear());

export const initialSalaryState = {
    month: currentMonth,
    year: currentYear,
    salaryData: [],
    isLoading: false,
    isGenerating: false,
    editingRow: null,
    bonusValue: "0",
    isReversing: false,
};

export function salaryReducer(state, action) {
    switch (action.type) {
        case 'SET_FIELD': return { ...state, [action.field]: action.value };
        case 'SET_SALARY_DATA': return { ...state, salaryData: action.data, isLoading: false };
        case 'UPDATE_SALARY_ROW':
            return {
                ...state,
                salaryData: state.salaryData.map(r => r.id === action.row.id ? action.row : r),
                editingRow: null,
            };
        case 'PATCH_CELL':
            return {
                ...state,
                salaryData: state.salaryData.map(r =>
                    r.id === action.rowId ? { ...r, [action.key]: action.value } : r
                ),
            };
        default: return state;
    }
}
