import { combineReducers } from "redux";
import authReducer from "./authReducer";
import scheduleReducer from './scheduleReducer';
export default combineReducers({
    auth: authReducer,
    schedule: scheduleReducer,
});
