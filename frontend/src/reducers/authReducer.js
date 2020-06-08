import { USER_LOADING_ACTION,
         USER_LOADED_ACTION,
         USER_NOT_AUTHED,
         USER_CREATED_ACTION,
         USER_NOT_CREATED,
         USER_CREATING_ACTION,
         USER_CREATING_FAILED } from '../actions/actionTypes';

const initialState = {
    isAuthenticated: false,
    user: {},
    loading: false,
    failed: false,
    created: false,
    creating: false,
};
export default (state = initialState, action) => {
    switch(action.type) {
        case USER_LOADING_ACTION:
            return {
                ...state,
                loading: true,
                failed: false,
                isAuthenticated: false,
                creating: false,
                created: false,
                user: {}
            };
        case USER_NOT_AUTHED:
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                created: false,
                failed: true,
                user: {},
                creating: false,
            };
        case USER_LOADED_ACTION:
            return {
                ...state,
                isAuthenticated: true,
                created: true,
                loading: false,
                failed: false,
                updating: false,
                creating: false,
                user: {...action.data}
            };
        case USER_CREATED_ACTION:
            return {
                ...state,
                isAuthenticated: true,
                created: true,
                creating: false,
                user: {...action.data}
            }
        case USER_NOT_CREATED:
            return {
                ...state,
                isAuthenticated: true,
                created: false,
                loading: false,
                failed: false,
                updating: false,
                creating: false
            };
        case USER_CREATING_ACTION:
            return {
                ...state,
                created: false,
                creating: true,
            };
        case USER_CREATING_FAILED:
            return {
                ...state,
                created: false,
                creating: false,
            };
        default:
            return state;
    }
}
