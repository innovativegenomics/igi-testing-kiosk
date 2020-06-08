import { USER_LOADING_ACTION,
         USER_LOADED_ACTION,
         USER_NOT_AUTHED,
         USER_CREATED_ACTION,
         USER_NOT_CREATED,
         USER_CREATING_ACTION,
         USER_CREATING_FAILED } from '../actions/actionTypes';
import axios from 'axios';

export const loadUser = () => dispatch => {
    dispatch(setUserLoading());
    return axios.post('/api/users/get/profile').then(res => {
        if(res.data.success) {
            dispatch(setUserData(res.data.user));
        } else {
            dispatch(setUserNotCreated());
        }
    }).catch(err => {
        console.error('error loading user');
        console.error(err);
        dispatch(setUserUnauthed());
    });
}

export const createUser = data => dispatch => {
    dispatch(setUserCreating());
    axios.post('/api/users/set/profile', data).then(res => {
        if(res.data.success) {
            dispatch(setUserCreated(data));
        } else {
            dispatch(setUserCreationFailed());
        }
    }).catch(err => {
        console.error('error creating user');
        console.error(err);
        dispatch(setUserUnauthed());
    });
}



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

/**
 * @param {object} data - new user object
 */
export const setUserData = data => {
    return {
        type: USER_LOADED_ACTION,
        data: data
    };
}


export const setUserCreating = () => {
    return {
        type: USER_CREATING_ACTION
    };
}

export const setUserCreated = data => {
    return {
        type: USER_CREATED_ACTION,
        data: data
    };
}

export const setUserCreationFailed = () => {
    return {
        type: USER_CREATING_FAILED
    };
}

export const setUserNotCreated = () => {
    return {
        type: USER_NOT_CREATED
    }
}
