const { Pool } = require('pg');
const env = process.env.NODE_ENV || 'development';
const config = require('./config/config.json')[env];
const pool = new Pool({
  user: config.username,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port || process.env.POSTGRES_PORT || 5432,
});
const { makeWorkerUtils } = require('graphile-worker');
const moment = require('moment');

let workerUtils;

module.exports.verifyTasks = async () => {
  workerUtils = await makeWorkerUtils({ pgPool: pool });
  await workerUtils.migrate();
}

module.exports.scheduleSlotConfirmText = async (number, uid, day, timeStart, timeEnd, location, locationLink) => {
  await workerUtils.addJob('slotConfirmText', {
    number: number,
    uid: uid,
    day: day,
    timeStart: timeStart,
    timeEnd: timeEnd,
    location: location,
    locationLink: locationLink
  });
}

module.exports.scheduleSlotConfirmEmail = async (email, uid, day, timeStart, timeEnd, location, locationLink) => {
  await workerUtils.addJob('slotConfirmEmail', {
    email: email,
    uid: uid,
    day: day,
    timeStart: timeStart,
    timeEnd: timeEnd,
    location: location,
    locationLink: locationLink
  });
}

module.exports.scheduleSignupEmail = async (email, name) => {
  await workerUtils.addJob('signupEmail', { email: email, name: name });
}

module.exports.scheduleResultInstructionsEmail = async (email) => {
  await workerUtils.addJob('resultInstructionsEmail', { email: email });
}

module.exports.scheduleRescheduleUsers = async () => {
  await workerUtils.addJob('rescheduleUsers', {}, { runAt: moment().startOf('week').add(1, 'week').add(1, 'minute').toDate(), jobKey: 'reschedule', queueName: 'rescheduleQueue' });
}

module.exports.scheduleNewAdminEmail = async (email, uid) => {
  await workerUtils.addJob('newAdminEmail', {email: email, uid: uid});
}

/**
 * 30 minute reminders
 * @param {string} email
 * @param {moment.Moment} slot - the time slot they signed up for
 */
module.exports.scheduleAppointmentReminderEmail = async (email, slot, uid) => {
  await workerUtils.addJob('appointmentReminderEmail', { email: email, time: slot.toDate(), uid: uid }, {
    runAt: slot.clone().subtract(2, 'hour'),
    jobKey: `${email}`,
    queueName: 'reminderEmails'
  });
}

module.exports.scheduleAppointmentReminderText = async (number, slot, uid) => {
  await workerUtils.addJob('appointmentReminderText', { number: number, time: slot.toDate(), uid: uid }, {
    runAt: slot.clone().subtract(30, 'minute'),
    jobKey: `${number}`,
    queueName: 'reminderTexts'
  });
}

module.exports.deleteAppointmentReminders = async (email, number) => {
  await pool.query('select graphile_worker.remove_job($1)', [email]);
  await pool.query('select graphile_worker.remove_job($1)', [number]);
}
