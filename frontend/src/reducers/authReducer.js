import { USER_LOADING_ACTION,
         USER_LOADED_ACTION,
         USER_NOT_AUTHED, 
         USER_UPDATING_ACTION,
         USER_UPDATE_FAILED,
         USER_VERIFIED } from '../actions/actionTypes';
import moment from 'moment';

const initialState = {
    isAuthenticated: false,
    user: {},
    loading: false,
    failed: false,
    fullUser: false,
    updating: false,
};
export default (state = initialState, action) => {
    switch(action.type) {
        case USER_LOADING_ACTION:
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
                requestingSlot: false,
                failed: true,
                user: {}
            };
        case USER_LOADED_ACTION:
            const updates = {};
            if(((action.data.firstname && action.data.firstname !== '') || (state.user.firstname && state.user.firstname !== '')) &&
                ((action.data.lastname && action.data.lastname !== '') || (state.user.lastname && state.user.lastname !== '')) && 
                (action.data.email || state.user.email)) {
                updates.fullUser = true;
            } else {
                updates.fullUser = false;
            }
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                failed: false,
                updating: false,
                user: {...state.user, ...action.data},
                ...updates
            };
        case USER_UPDATING_ACTION:
            return {
                ...state,
                updating: true,
            };
        case USER_UPDATE_FAILED:
            return {
                ...state,
                updating: false,
            };
        case USER_VERIFIED:
            return {
                ...state,
                user: {...state.user, nextappointment: action.nextappointment, testverified: moment()}
            };
        default:
            return state;
    }
}
