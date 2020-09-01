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

export const uncompleteSlot = async uid => {
  try {
    const response = await axios.post('/api/admin/uncomplete', { uid: uid });
    return response.data;
  } catch(err) {
    console.error(`Can't uncomplete slot`);
    console.error(err);
    return { success: false };
  }
}

export const searchSlots = async (term, perpage, page) => {
  try {
    const response = await axios.get('/api/admin/search/slots', { params: { term: term, perpage: perpage, page: page } });
    return response.data;
  } catch(err) {
    console.error(`Can't search slots`);
    console.error(err);
    return { success: false };
  }
}

export const searchParticipants = async (term, perpage, page) => {
  try {
    const response = await axios.get('/api/admin/search/participants', { params: { term: term, perpage: perpage, page: page } });
    return response.data;
  } catch(err) {
    console.error(`Can't search slots`);
    console.error(err);
    return { success: false };
  }
}

export const getScheduledSlotsStat = async (location, starttime, endtime) => {
  try {
    const response = await axios.get('/api/admin/stats/slots', { params: { location: location, starttime: starttime, endtime: endtime } });
    return response.data;
  } catch(err) {
    console.error(`Can't search slots`);
    console.error(err);
    return { success: false };
  }
}

export const getScheduledParticipantsStat = async () => {
  try {
    const response = await axios.get('/api/admin/stats/general/scheduled');
    return response.data;
  } catch(err) {
    console.error(`Can't get scheduled participants`);
    console.error(err);
    return { success: false };
  }
}

export const getUnscheduledParticipantsStat = async () => {
  try {
    const response = await axios.get('/api/admin/stats/general/unscheduled');
    return response.data;
  } catch(err) {
    console.error(`Can't get unscheduled participants`);
    console.error(err);
    return { success: false };
  }
}

export const getReconsentedParticipantsStat = async () => {
  try {
    const response = await axios.get('/api/admin/stats/general/reconsented');
    return response.data;
  } catch(err) {
    console.error(`Can't get reconsented participants`);
    console.error(err);
    return { success: false };
  }
}

export const getNewUsersStat = async (fromDate, toDate) => {
  try {
    const response = await axios.get('/api/admin/stats/newusers', {params: {
      fromDate: fromDate,
      toDate: toDate
    }});
    return response.data;
  } catch(err) {
    console.error(`Can't get newuser stats`);
    console.error(err);
    return { success: false };
  }
}

export const getCompletionStat = async () => {
  try {
    const response = await axios.get('/api/admin/stats/completion');
    return response.data;
  } catch(err) {
    console.error(`Can't get completion stats`);
    console.error(err);
    return { success: false };
  }
}

/**
 * returns array of day dates
 */
export const getAvailableDays = async () => {
  try {
    const response = await axios.get('/api/admin/settings/days');
    return response.data;
  } catch(err) {
    console.error(`Can't get days`);
    console.error(err);
    return { success: false };
  }
}

/**
 * returns array of locations
 */
export const getAvailableLocations = async () => {
  try {
    const response = await axios.get('/api/admin/settings/locations');
    return response.data;
  } catch(err) {
    console.error(`Can't get locations`);
    console.error(err);
    return { success: false };
  }
}

export const createDay = async data => {
  try {
    const response = await axios.post('/api/admin/settings/day', {...data, date: data.date.format()});
    return response.data;
  } catch(err) {
    console.error(`Can't create day`);
    console.error(err);
    return { success: false };
  }
}
export const deleteDay = async (date, location, reason) => {
  try {
    const response = await axios.delete('/api/admin/settings/day', {params: {date: date, location: location, reason: reason}});
    return response.data;
  } catch(err) {
    console.error(`Can't delete day`);
    console.error(err);
    return { success: false };
  }
}

export const getDaySettings = async d => {
  try {
    const response = await axios.get('/api/admin/settings/day', { params: { day: d } });
    return response.data;
  } catch(err) {
    console.error(`Can't get day`);
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

export const updateUser = async (calnetid, params) => {
  try {
    const response = await axios.patch('/api/admin/participant', {calnetid: calnetid, params: params});
    return response.data;
  } catch(err) {
    console.error(`Can't patch participant`);
    console.error(err);
    return { success: false };
  }
}

export const deleteUser = async (calnetid) => {
  try {
    const response = await axios.delete('/api/admin/participant', {params: {calnetid: calnetid}});
    return response.data;
  } catch(err) {
    console.error(`Can't delete participant`);
    console.error(err);
    return { success: false };
  }
}

export const getExternalUsers = async search => {
  try {
    const response = await axios.get('/api/admin/external/users', {params: {search: search}});
    return response.data;
  } catch(err) {
    console.error(`Can't get external users`);
    console.error(err);
    return { success: false };
  }
}

export const approveExternalUser = async uid => {
  try {
    const response = await axios.post('/api/admin/external/approve', {uid: uid});
    return response.data;
  } catch(err) {
    console.error(`Can't approve external user`);
    console.error(err);
    return { success: false };
  }
}

export const rejectExternalUser = async uid => {
  try {
    const response = await axios.delete('/api/admin/external/user', {params: {uid: uid}});
    return response.data;
  } catch(err) {
    console.error(`Can't reject external user`);
    console.error(err);
    return { success: false };
  }
}

export const updateDayBuffer = async (date, loc, buffer) => {
  try {
    const response = await axios.patch('/api/admin/settings/day/buffer', {date, loc, buffer});
    return response.data;
  } catch(err) {
    console.error(`Can't update day buffer`);
    console.error(err);
    return { success: false };
  }
}
