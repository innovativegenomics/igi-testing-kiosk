import axios from 'axios';

export const getTube = async () => {
  try {
    const response = await axios.get('/api/tubes/tube');
    return response.data;
  } catch (err) {
    console.error('error loading tube');
    console.error(err);
    return { success: false };
  }
}

export const getAvailableDropoffs = async () => {
  try {
    const response = await axios.get('/api/tubes/available_dropoffs');
    return response.data;
  } catch (err) {
    console.error('error loading available dropoffs');
    console.error(err);
    return { success: false };
  }
}

export const requestDropoff = async id => {
  try {
    const response = await axios.post('/api/tubes/request', {id});
    return response.data;
  } catch (err) {
    console.error('error requesting dropoff');
    console.error(err);
    return { success: false };
  }
}

export const cancelDropoff = async () => {
  try {
    const response = await axios.delete('/api/tubes/cancel');
    return response.data;
  } catch (err) {
    console.error('error cancelling dropoff');
    console.error(err);
    return { success: false };
  }
}
