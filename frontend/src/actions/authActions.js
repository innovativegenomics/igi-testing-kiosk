import { USER_LOADING_ACTION,
         USER_LOADED_ACTION,
         USER_NOT_AUTHED,
         USER_UPDATING_ACTION,
         USER_UPDATE_FAILED,
         USER_VERIFIED } from '../actions/actionTypes';
import axios from 'axios';

export const loadUser = () => dispatch => {
    dispatch(setUserLoading());
    return axios.get('/api/users/get/profile').then(res => {
        if(res.status === 200) {
            dispatch(setUserData(res.data));
        } else {
            dispatch(setUserUnauthed());
        }
    }).catch(err => {
        console.error('error loading user');
        console.error(err);
        dispatch(setUserUnauthed());
    });
}

export const updateUser = data => dispatch => {
    dispatch(setUserUpdating());
    const promiseChain = [];
    if(data.firstname) {
        promiseChain.push(axios.post('/api/users/set/firstname', {firstname: data.firstname}));
    }
    if(data.lastname) {
        promiseChain.push(axios.post('/api/users/set/lastname', {lastname: data.lastname}));
    }
    if(data.email) {
        promiseChain.push(axios.post('/api/users/set/email', {email: data.email}));
    }
    if(data.phone) {
        promiseChain.push(axios.post('/api/users/set/phone', {phone: data.phone}));
    }
    if(data.alertemail) {
        promiseChain.push(axios.post('/api/users/set/alertemail', {alertemail: data.alertemail}));
    }
    if(data.alertphone) {
        promiseChain.push(axios.post('/api/users/set/alertphone', {alertphone: data.alertphone}));
    }
    Promise.all(promiseChain).then(r => dispatch(setUserData(data))).catch(err => {
        console.error('Error updating user');
        console.error(err);
        dispatch(setUserUpdateFailed());
    });
}

export const submitScreening = data => {
    return axios.post('/api/users/submit_screening', data).then(res => {
        if(res.status === 200) {
            return true;
        } else {
            throw Error('error submitting screen questions');
        }
    }).catch(err => {
        console.error(err);
        return false;
    });
}

export const testVerifyUser = () => dispatch => {
    return axios.post('/api/schedule/verify_user').then(res => {
        if(res.status === 200) {
            dispatch(setUserVerified(res.data.nextappointment));
        } else {
            console.error('could not verify user');
        }
    }).catch(err => {
        console.error(err);
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

export const setUserUpdating = () => {
    return {
        type: USER_UPDATING_ACTION,
    };
}

export const setUserUpdateFailed = () => {
    return {
        type: USER_UPDATE_FAILED
    };
}

export const setUserVerified = nextappointment => {
    return {
        type: USER_VERIFIED,
        nextappointment: nextappointment
    };
}
