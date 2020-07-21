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
    return { success: response.data.success };
  } catch(err) {
    console.error('error creating user');
    console.error(err);
    return { success: false };
  }
}

export const reconsentUser = async questions => {
  try {
    const response = await axios.post('/api/users/reconsent', { questions: questions });
    return { success: response.data.success };
  } catch(err) {
    console.error('error reconsenting user');
    console.error(err);
    return { success: false };
  }
}

export const externalSignup = async (data, token) => {
  try {
    const response = await axios.post('/api/users/external/signup', { ...data }, {params: {'g-recaptcha-response': token}});
    return response.data;
  } catch(err) {
    console.error('error signing up external user');
    console.error(err);
    return { success: false };
  }
}

export const externalSetPassword = async (data, uid, token) => {
  try {
    const response = await axios.post('/api/users/external/create', { ...data, uid: uid }, {params: {'g-recaptcha-response': token}});
    return response.data;
  } catch(err) {
    console.error('error creating external user');
    console.error(err);
    return { success: false };
  }
}

export const externalLogin = async (data, token) => {
  try {
    const response = await axios.post('/api/users/external/login', { ...data }, {params: {'g-recaptcha-response': token}});
    return response.data;
  } catch(err) {
    console.error('error logging in external user');
    console.error(err);
    return { success: false };
  }
}

export const externalForgotPassword = async (data, token) => {
  try {
    const response = await axios.post('/api/users/external/forgot', { ...data }, {params: {'g-recaptcha-response': token}});
    return response.data;
  } catch(err) {
    console.error('error sending forgot password email');
    console.error(err);
    return { success: false };
  }
}

export const externalResetPassword = async (data, uid, token) => {
  try {
    const response = await axios.post('/api/users/external/reset', { ...data, uid: uid }, {params: {'g-recaptcha-response': token}});
    return response.data;
  } catch(err) {
    console.error('error sending forgot password email');
    console.error(err);
    return { success: false };
  }
}
