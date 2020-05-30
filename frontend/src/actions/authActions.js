import { USER_LOADING_ACTION,
         USER_LOADED_ACTION,
         USER_NOT_AUTHED,
         USER_UPDATING_ACTION,
         USER_UPDATE_FAILED,
         USER_REQUESTING_SLOT,
         USER_SET_SLOT,
         USER_SLOT_REQUEST_FAILED,
         USER_CANCEL_APPOINTMENT} from '../actions/actionTypes';
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

export const requestSlot = (location, slot) => dispatch => {
    dispatch(setRequestingSlot());
    axios.post('/api/schedule/request_time_slot', {location: location, moment: slot}).then(res => {
        if(res.status === 200) {
            dispatch(setRequestSlot(location, slot, res.data.uid));
        } else {
            console.error('Error requesting time slot');
            console.error(res);
            dispatch(setSlotRequestFailed());
        }
    }).catch(err => {
        console.error('Error requesting time slot');
        console.error(err);
        dispatch(setSlotRequestFailed());
    });
}

export const cancelAppointment = () => dispatch => {
    axios.post('/api/schedule/request_cancel_appointment').then(res => {
        if(res.status === 200) {
            dispatch(setAppointmentCanceled());
        } else {
            console.error('Error canceling appointment');
            console.error(res);
        }
    }).catch(err => {
        console.error('Error canceling appointment');
        console.error(err);
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

export const setRequestingSlot = () => {
    return {
        type: USER_REQUESTING_SLOT
    };
}

export const setRequestSlot = (location, slot, uid) => {
    return {
        type: USER_SET_SLOT,
        location: location,
        slot: slot,
        uid: uid
    };
}

export const setSlotRequestFailed = () => {
    return {
        type: USER_SLOT_REQUEST_FAILED
    };
}

export const setAppointmentCanceled = () => {
    return {
        type: USER_CANCEL_APPOINTMENT,
    };
}
