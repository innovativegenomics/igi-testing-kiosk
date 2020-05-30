import { SCHEDULE_LOADING,
         SCHEDULE_LOADED,
         SCHEDULE_EMPTY } from '../actions/actionTypes';

const initialState = {
    slotsAvailable: {},
    loading: false,
    loaded: false,
};

export default (state = initialState, action) => {
    switch(action.type) {
        case SCHEDULE_LOADING:
            return {
                ...state,
                loading: true,
                loaded: false
            };
        case SCHEDULE_LOADED:
            return {
                ...state,
                slotsAvailable: {...action.data},
                loading: false,
                loaded: true
            };
        case SCHEDULE_EMPTY:
            return {
                ...state,
                slotsAvailable: {},
                loading: false,
                loaded: false
            };
        default:
            return state;
    }
}
