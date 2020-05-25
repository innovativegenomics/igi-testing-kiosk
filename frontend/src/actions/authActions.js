import { USER_LOADING_ACTION,
         USER_LOADED_ACTION,
         USER_NOT_AUTHED } from '../actions/actionTypes';

export const setUserLoading = () => {
    return {
        type: USER_LOADING_ACTION,
    };
}

export const setUserUnauthed = () => {
    return {
        type: USER_NOT_AUTHED
    };
}

export const setUserData = (data) => {
    return {
        type: USER_LOADED_ACTION,
        data: data
    };
}
