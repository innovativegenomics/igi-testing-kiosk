import axios from 'axios';

/**
 * @returns {Promise} Promise resolves when user loaded
 */
export const getSlot = async () => {
  try {
    const response = await axios.get('/api/slots/slot');
    return response.data;
  } catch (err) {
    console.error('error loading slot');
    console.error(err);
    return { success: false };
  }
}
/**
 * @returns {Promise} Promise resolves when user loaded
 */
export const getAvailable = async () => {
  try {
    const response = await axios.get('/api/slots/available');
    return response.data;
  } catch (err) {
    console.error('error loading schedule');
    console.error(err);
    return { success: false };
  }
}
/**
 * @returns {Promise} Promise resolves when user loaded
 */
export const requestSlot = async (slot, location, questions) => {
  try {
    const response = await axios.post('/api/slots/slot', { time: slot, location: location, questions: questions });
    return response.data;
  } catch (err) {
    console.error('error requesting slot');
    console.error(err);
    return { success: false };
  }
}
/**
 * @returns {Promise} Promise resolves when slot cancelled
 */
export const cancelSlot = async () => {
  try {
    const response = await axios.delete('/api/slots/slot');
    return response.data;
  } catch (err) {
    console.error('error requesting slot');
    console.error(err);
    return { success: false };
  }
}

/**
 * 
 * @param {moment.Moment} time 
 * @param {string} location 
 */
export const reserveSlot = async (time, location) => {
  try {
    const response = await axios.post('/api/slots/reserve', {time: time, location: location});
    return response.data;
  } catch (err) {
    console.error('error reserving slot');
    console.error(err);
    return { success: false };
  }
}

export const deleteReservedSlot = async () => {
  try {
    const response = await axios.delete('/api/slots/reserve');
    return response.data;
  } catch (err) {
    console.error('error deleting reserved slot');
    console.error(err);
    return { success: false };
  }
}
