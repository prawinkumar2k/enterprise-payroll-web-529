export const emptyFormData = {
    UserID: "", UserName: "", Password: "", Role: "",
    Department: "", Qualification: "", Contact: "", Remark: ""
};

export const initialUsersState = {
    users: [],
    loading: true,
    error: "",
    searchTerm: "",
    roleFilter: "",
    isModalOpen: false,
    currentUser: null,
    viewMode: false,
    formData: { ...emptyFormData },
};

export function usersReducer(state, action) {
    switch (action.type) {
        case 'SET_FIELD': return { ...state, [action.field]: action.value };
        case 'SET_FORM_FIELD': return { ...state, formData: { ...state.formData, [action.field]: action.value } };
        case 'OPEN_MODAL': return {
            ...state,
            isModalOpen: true,
            currentUser: action.user,
            viewMode: action.viewMode,
            formData: action.user
                ? { ...action.user, Password: "" }
                : { ...emptyFormData },
        };
        case 'CLOSE_MODAL': return { ...state, isModalOpen: false, currentUser: null, viewMode: false };
        default: return state;
    }
}
