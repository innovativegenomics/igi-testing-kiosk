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
    return response.data;
  } catch(err) {
    console.error(`Can't complete slot`);
    console.error(err);
    return { success: false };
  }
}

export const searchSlots = async (term, perpage, page) => {
  try {
    const response = await axios.get('/api/admin/search', { params: { term: term, perpage: perpage, page: page } });
    return response.data;
  } catch(err) {
    console.error(`Can't search slots`);
    console.error(err);
    return { success: false };
  }
}

export const getScheduledSlotsStat = async (starttime, endtime) => {
  try {
    const response = await axios.get('/api/admin/stats/slots/scheduled', { params: { starttime: starttime.format(), endtime: endtime.format() } });
    return response.data;
  } catch(err) {
    console.error(`Can't search slots`);
    console.error(err);
    return { success: false };
  }
}

export const getAdmins = async () => {
  try {
    const response = await axios.get('/api/admin/admins');
    return response.data;
  } catch(err) {
    console.error(`Can't get admins`);
    console.error(err);
    return { success: false };
  }
}

export const getAdminsPending = async () => {
  try {
    const response = await axios.get('/api/admin/admins/pending');
    return response.data;
  } catch(err) {
    console.error(`Can't get admins pending`);
    console.error(err);
    return { success: false };
  }
}

export const removeAdmin = async uid => {
  try {
    const response = await axios.delete('/api/admin/admins', { params: { uid: uid } });
    return response.data;
  } catch(err) {
    console.error(`Can't remove admin ${uid}`);
    console.error(err);
    return { success: false };
  }
}

export const createAdmin = async (name, email, level) => {
  try {
    const response = await axios.post('/api/admin/admins', { name: name, email: email, level: level });
    return response.data;
  } catch(err) {
    console.error(`Can't create admin ${name}`);
    console.error(err);
    return { success: false };
  }
}

export const getSettings = async () => {
  try {
    const response = await axios.get('/api/admin/settings');
    return response.data;
  } catch(err) {
    console.error(`Can't get settings`);
    console.error(err);
    return { success: false };
  }
}
