import axios from 'axios';

/**
 * @returns {Promise} Promise resolves when user loaded
 */
export const getUser = async () => {
  try {
    const response = await axios.get('/api/users/profile');
    return response.data;
  } catch(err) {
    console.error('error loading user');
    console.error(err);
    return { success: false, unauthed: true };
  }
}

export const createUser = async data => {
  try {
    const response = await axios.post('/api/users/profile', data);
    return { success: response.success };
  } catch(err) {
    console.error('error creating user');
    console.error(err);
    return { success: false };
  }
}
