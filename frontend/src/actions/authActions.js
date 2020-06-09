import axios from 'axios';

/**
 * @returns {Promise} Promise resolves when user loaded
 */
export const loadUser = () => {
    return axios.post('/api/users/get/profile').then(res => {
        return res.data;
    }).catch(err => {
        console.error('error loading user');
        console.error(err);
        return {unauthed: true};
    });
}

export const createUser = data => {
    return axios.post('/api/users/set/profile', data).then(res => {
        return {success: res.success};
    }).catch(err => {
        console.error('error creating user');
        console.error(err);
        return {success: false};
    });
}
