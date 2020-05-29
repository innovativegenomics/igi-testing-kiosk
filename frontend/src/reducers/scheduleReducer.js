import { SCHEDULE_LOADING,
         SCHEDULE_LOADED,
         SCHEDULE_EMPTY } from '../actions/actionTypes';

const initialState = {
    slotsAvailable: {},
    loading: true
};

export default (state = initialState, action) => {
    switch(action.type) {
        case SCHEDULE_LOADING:
            return {
                ...state,
                loading: true
            };
        case SCHEDULE_LOADED:
            return {
                ...state,
                slotsAvailable: {...action.data},
                loading: false
            };
        case SCHEDULE_EMPTY:
            return {
                ...state,
                slotsAvailable: {},
                loading: false
            };
        default:
            return state;
    }
}
