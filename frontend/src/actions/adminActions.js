import axios from 'axios';

/**
 * @returns {Promise} Promise resolves when user loaded
 * Promise returns {success: true|false, errors: [], slot: {slot: string, location}}
 */
export const getSlot = uid => {
    return axios.post('/api/admin/get/slot', {uid: uid}).then(res => {
        console.log(res);
        return res.data;
    }).catch(err => {
        console.error('error loading user');
        console.error(err);
        return {success: false};
    });
}
