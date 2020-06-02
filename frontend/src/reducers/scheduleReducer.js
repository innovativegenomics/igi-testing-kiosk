import { SCHEDULE_LOADING,
         SCHEDULE_LOADED,
         SCHEDULE_EMPTY,
         SCHEDULE_SLOT_LOADING,
         SCHEDULE_SLOT_FAILED,
         SCHEDULE_REQUESTING_SLOT,
         SCHEDULE_SET_SLOT,
         SCHEDULE_SLOT_REQUEST_FAILED,
         SCHEDULE_CANCEL_SLOT
          } from '../actions/actionTypes';

const initialState = {
    slot: {},
    schedule: {},
    scheduleLoading: false,
    scheduleLoaded: false,
    slotLoading: false,
    slotLoaded: false,
};

export default (state = initialState, action) => {
    switch(action.type) {
        case SCHEDULE_LOADING:
            return {
                ...state,
                scheduleLoading: true,
                scheduleLoaded: false
            };
        case SCHEDULE_LOADED:
            return {
                ...state,
                schedule: {...action.data},
                scheduleLoading: false,
                scheduleLoaded: true
            };
        case SCHEDULE_EMPTY:
            return {
                ...state,
                schedule: {},
                scheduleLoading: false,
                scheduleLoaded: false
            };
        case SCHEDULE_SLOT_LOADING:
            return {
                ...state,
                slotLoading: true,
                slotLoaded: false
            };
        case SCHEDULE_SLOT_FAILED:
            return {
                ...state,
                slotLoading: false,
                slotLoaded: false
            };
        case SCHEDULE_REQUESTING_SLOT:
            return {
                ...state,
                slotLoading: true,
            };
        case SCHEDULE_SET_SLOT:
            return {
                ...state,
                slot: {
                    location: action.location,
                    slot: action.slot,
                    uid: action.uid
                },
                slotLoading: false,
                slotLoaded: true
            };
        case SCHEDULE_SLOT_REQUEST_FAILED:
            return {
                ...state,
                slotLoading: false,
                slotLoaded: false
            }
        case SCHEDULE_CANCEL_SLOT:
            return {
                ...state,
                slot: {},
                slotLoading: false,
                slotLoaded: false
            };
        default:
            return state;
    }
}
