import axios from 'axios';

/**
 * @returns {Promise} Promise resolves when user loaded
 */
export const loadSlot = () => {
    return axios.post('/api/schedule/get/slot').then(res => {
        return res.data;
    }).catch(err => {
        console.error('error loading slot');
        console.error(err);
        return {success: false};
    });
}
/**
 * @returns {Promise} Promise resolves when user loaded
 */
export const loadSchedule = () => {
    return axios.post('/api/schedule/get/available').then(res => {
        return res.data;
    }).catch(err => {
        console.error('error loading schedule');
        console.error(err);
        return {success: false};
    });
}
/**
 * @returns {Promise} Promise resolves when user loaded
 */
export const requestSlot = (slot, location) => {
    return axios.post('/api/schedule/set/slot', {slot: slot, location: location}).then(res => {
        return res.data;
    }).catch(err => {
        console.error('error requesting slot');
        console.error(err);
        return {success: false};
    });
}
/**
 * @returns {Promise} Promise resolves when slot cancelled
 */
export const cancelSlot = () => {
    return axios.post('/api/schedule/set/cancel').then(res => {
        return res.data;
    }).catch(err => {
        console.error('error requesting slot');
        console.error(err);
        return {success: false};
    });
}
