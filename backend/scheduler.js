const { request } = require("express");

const { Pool } = require('pg');
const env = process.env.NODE_ENV || 'development';
const config = require('./config/config.json')[env];
const pool = new Pool({
  user: config.username,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port || 5432,
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

module.exports.scheduleSignupEmail = async (email) => {
  await workerUtils.addJob('signupEmail', { email: email });
}

module.exports.scheduleRescheduleUsers = async () => {
  await workerUtils.addJob('rescheduleUsers', {}, { runAt: moment().startOf('week').add(1, 'week').add(1, 'minute'), jobKey: 'reschedule', queueName: 'rescheduleQueue' });
}

module.exports.scheduleNewAdminEmail = async (email, uid) => {
  await workerUtils.addJob('newAdminEmail', {email: email, uid: uid});
}
