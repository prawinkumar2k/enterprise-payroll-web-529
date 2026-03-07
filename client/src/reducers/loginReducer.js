export const initialLoginState = {
    companyId: "",
    userId: "",
    password: "",
    showPassword: false,
    rememberMe: false,
    isLoading: false,
    error: "",
};

export function loginReducer(state, action) {
    switch (action.type) {
        case 'SET_FIELD': return { ...state, [action.field]: action.value };
        case 'SUBMIT_START': return { ...state, isLoading: true, error: "" };
        case 'SUBMIT_ERROR': return { ...state, isLoading: false, error: action.error };
        default: return state;
    }
}
