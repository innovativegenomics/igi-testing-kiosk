import axios from 'axios';

export const getAdminLevel = async () => {
  try {
    const response = await axios.get('/api/admin/level');
    return response.data;
  } catch(err) {
    console.error(`Can't get admin level`);
    console.error(err);
    return { success: false };
  }
}

export const getSlotInfo = async uid => {
  try {
    const response = await axios.get('/api/admin/slot', { params: { uid: uid } });
    return response.data;
  } catch(err) {
    console.error(`Can't get slot info`);
    console.error(err);
    return { success: false };
  }
}

export const completeSlot = async uid => {
  try {
    const response = await axios.post('/api/admin/complete', { uid: uid });
    return response;
  } catch(err) {
    console.error(`Can't complete slot`);
    console.error(err);
    return { success: false };
  }
}

export const searchSlots = async term => {
  try {
    const response = await axios.get('/api/admin/search', { params: { term: term } });
    return response;
  } catch(err) {
    console.error(`Can't search slots`);
    console.error(err);
    return { success: false };
  }
}
