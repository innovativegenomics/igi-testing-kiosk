import { SCHEDULE_LOADING,
         SCHEDULE_LOADED,
         SCHEDULE_EMPTY } from './actionTypes';
import axios from 'axios';
// import moment from 'moment';

/**
 * @param {moment.Moment} day - day to get schedule for
 */
export const loadSchedule = day => dispatch => {
    dispatch(setScheduleLoading());
    return axios.post('/api/schedule/get_time_slots', {moment: day}).then(res => {
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
