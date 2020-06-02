import { SCHEDULE_LOADING,
         SCHEDULE_LOADED,
         SCHEDULE_EMPTY,
         SCHEDULE_SLOT_LOADING,
         SCHEDULE_SLOT_FAILED,
         SCHEDULE_REQUESTING_SLOT,
         SCHEDULE_SET_SLOT,
         SCHEDULE_CANCEL_SLOT,
         SCHEDULE_SLOT_REQUEST_FAILED} from './actionTypes';
import axios from 'axios';
import moment from 'moment';

/**
 * @param {moment.Moment} day - day to get schedule for
 */
export const loadSchedule = day => dispatch => {
    dispatch(setScheduleLoading());
    return axios.post('/api/schedule/get_time_slots', {moment: day}).then(res => {
        console.log(res);
        if(res.status === 200) {
            // for(var loc in res.data) {
            //     for(var m in res.data[key]) {
            //         res.data[key][m].time = moment(res.data[key][m].time);
            //     }
            // }
            dispatch(setScheduleLoaded(res.data));
        } else {
            console.error('error loading schedules ' + res);
            dispatch(setScheduleEmpty());
        }
    }).catch(err => {
        console.error('error loading schedules');
        console.error(err);
        dispatch(setScheduleEmpty());
    });
}

export const loadSlot = () => dispatch => {
    dispatch(setSlotLoading());
    axios.post('/api/schedule/get_current_slot').then(res => {
        if(res.status === 200) {
            if(res.data.appointmentslot) {
                dispatch(setSlot(res.data.location, moment(res.data.appointmentslot), res.data.appointmentuid));
            } else {
                dispatch(setSlot(undefined, undefined, undefined));
            }
        } else {
            dispatch(setSlotLoadFailed());
        }
    }).catch(err => {
        console.error(err);
        dispatch(setSlotLoadFailed());
    });
}

export const requestSlot = (location, slot) => dispatch => {
    dispatch(setRequestingSlot());
    axios.post('/api/schedule/request_time_slot', {location: location, moment: slot}).then(res => {
        if(res.status === 200) {
            dispatch(setSlot(location, slot, res.data.uid));
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

export const cancelSlot = () => dispatch => {
    axios.post('/api/schedule/request_cancel_appointment').then(res => {
        if(res.status === 200) {
            dispatch(setSlotCanceled());
        } else {
            console.error('Error canceling appointment');
            console.error(res);
        }
    }).catch(err => {
        console.error('Error canceling appointment');
        console.error(err);
    });
}



export const setScheduleLoading = () => {
    return {
        type: SCHEDULE_LOADING,
    };
}

export const setScheduleLoaded = data => {
    return {
        type: SCHEDULE_LOADED,
        data: data,
    };
}

export const setScheduleEmpty = () => {
    return {
        type: SCHEDULE_EMPTY,
    };
}

export const setSlotLoading = () => {
    return {
        type: SCHEDULE_SLOT_LOADING
    };
}

export const setSlotLoadFailed = () => {
    return {
        type: SCHEDULE_SLOT_FAILED
    };
}

export const setRequestingSlot = () => {
    return {
        type: SCHEDULE_REQUESTING_SLOT
    };
}

export const setSlot = (location, slot, uid) => {
    return {
        type: SCHEDULE_SET_SLOT,
        location: location,
        slot: slot,
        uid: uid
    };
}

export const setSlotRequestFailed = () => {
    return {
        type: SCHEDULE_SLOT_REQUEST_FAILED
    };
}

export const setSlotCanceled = () => {
    return {
        type: SCHEDULE_CANCEL_SLOT,
    };
}
