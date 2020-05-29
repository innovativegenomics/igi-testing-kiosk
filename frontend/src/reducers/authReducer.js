import { USER_LOADING_ACTION,
         USER_LOADED_ACTION,
         USER_NOT_AUTHED } from '../actions/actionTypes';

const initialState = {
    isAuthenticated: false,
    user: {},
    loading: false,
    failed: false,
    fullUser: false,
    hasSlot: false
};
export default (state = initialState, action) => {
    switch(action.type) {
        case USER_LOADING_ACTION:
            console.log('set loading');
            return {
                ...state,
                loading: true,
                failed: false,
                isAuthenticated: false,
                user: {}
            };
        case USER_NOT_AUTHED:
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                failed: true,
                user: {}
            };
        case USER_LOADED_ACTION:
            const updates = {};
            if(((action.data.firstname && action.data.firstname !== '') || (state.user.firstname && state.user.firstname !== '')) &&
                ((action.data.lastname && action.data.lastname !== '') || (state.user.lastname && state.user.lastname !== ''))) {
                updates.fullUser = true;
            } else {
                updates.fullUser = false;
            }
            if(action.data.appointmentslot || state.user.appointmentslot) {
                updates.hasSlot = true;
            } else {
                updates.hasSlot = false;
            }
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                failed: false,
                user: {...state.user, ...action.data},
                ...updates
            };
        default:
            return state;
    }
}
