import { USER_LOADING_ACTION,
         USER_LOADED_ACTION,
         USER_NOT_AUTHED } from '../actions/actionTypes';
import axios from 'axios';

export const loadUser = () => dispatch => {
    dispatch(setUserLoading());
    return axios.post('/api/users/get/profile').then(res => {
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

export const setFirstName = firstname => dispatch => {
    return axios.post('/api/users/set/firstname', {firstname: firstname}).then(res => {
        if(res.status === 200) {
            dispatch(setUserData({firstname: firstname}));
        } else {
            console.error('could not set first name: ' + res.status);
        }
    }).catch(err => {
        console.error('could not set first name');
        console.error(err);
    });
}

export const setLastName = lastname => dispatch => {
    return axios.post('/api/users/set/lastname', {lastname: lastname}).then(res => {
        if(res.status === 200) {
            dispatch(setUserData({lastname: lastname}));
        } else {
            console.error('could not set last name: ' + res.status);
        }
    }).catch(err => {
        console.error('could not set last name');
        console.error(err);
    });
}

export const setLastName = lastname => dispatch => {
    return axios.post('/api/users/set/lastname', {lastname: lastname}).then(res => {
        if(res.status === 200) {
            dispatch(setUserData({lastname: lastname}));
        } else {
            console.error('could not set last name: ' + res.status);
        }
    }).catch(err => {
        console.error('could not set last name');
        console.error(err);
    });
}

export const setEmail = email => dispatch => {
    return axios.post('/api/users/set/email', {email: email}).then(res => {
        if(res.status === 200) {
            dispatch(setUserData({email: email}));
        } else {
            console.error('could not set email: ' + res.status);
        }
    }).catch(err => {
        console.error('could not set email');
        console.error(err);
    });
}

export const setPhone = phone => dispatch => {
    return axios.post('/api/users/set/phone', {phone: phone}).then(res => {
        if(res.status === 200) {
            dispatch(setUserData({phone: phone}));
        } else {
            console.error('could not set phone: ' + res.status);
        }
    }).catch(err => {
        console.error('could not set phone');
        console.error(err);
    });
}

export const setAlertEmail = alertemail => dispatch => {
    return axios.post('/api/users/set/alertemail', {alertemail: alertemail}).then(res => {
        if(res.status === 200) {
            dispatch(setUserData({alertemail: alertemail}));
        } else {
            console.error('could not set alertemail: ' + res.status);
        }
    }).catch(err => {
        console.error('could not set alertemail');
        console.error(err);
    });
}

export const setAlertPhone = alertphone => dispatch => {
    return axios.post('/api/users/set/alertphone', {alertphone: alertphone}).then(res => {
        if(res.status === 200) {
            dispatch(setUserData({alertphone: alertphone}));
        } else {
            console.error('could not set alertphone: ' + res.status);
        }
    }).catch(err => {
        console.error('could not set alertphone');
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
