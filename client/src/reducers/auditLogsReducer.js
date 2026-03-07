export const initialAuditState = {
    logs: [],
    loading: true,
    error: "",
    expandedLog: null,
    userNameFilter: "",
    roleFilter: "",
    actionFilter: "",
    startDate: "",
    endDate: "",
    filtersOpen: false,
};

export function auditLogsReducer(state, action) {
    switch (action.type) {
        case 'SET_FIELD': return { ...state, [action.field]: action.value };
        case 'SET_LOGS': return { ...state, logs: action.logs, loading: false, error: "" };
        case 'SET_ERROR': return { ...state, error: action.error, loading: false };
        case 'SET_LOADING': return { ...state, loading: action.value };
        case 'CLEAR_FILTERS': return { ...state, userNameFilter: "", roleFilter: "", actionFilter: "", startDate: "", endDate: "" };
        default: return state;
    }
}
