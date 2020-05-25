import { USER_LOADING_ACTION,
         USER_LOADED_ACTION,
         USER_NOT_AUTHED } from '../actions/actionTypes';

const initialState = {
    isAuthenticated: false,
    user: {},
    loading: false
};
export default (state = initialState, action) => {
    console.log(action);
    switch(action.type) {
        case USER_LOADING_ACTION:
            return {
                ...state,
                loading: true
            };
        case USER_NOT_AUTHED:
            return {
                ...state,
                loading: false,
                isAuthenticated: false
            };
        case USER_LOADED_ACTION:
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.data
            };
        default:
            return state;
    }
}
