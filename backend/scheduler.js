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

module.exports.verifyTasks = () => {
    return makeWorkerUtils({pgPool: pool}).then(r => (workerUtils=r)).then(r => {
        return workerUtils.migrate();
    });
}

module.exports.scheduleSlotConfirmText = (number, uid, day, timeStart, timeEnd, location, locationLink) => {
    return workerUtils.addJob('slotConfirmText', {number: number,
                                              uid: uid,
                                              day: day,
                                              timeStart: timeStart,
                                              timeEnd: timeEnd,
                                              location: location,
                                              locationLink: locationLink});
}

module.exports.scheduleSlotConfirmEmail = (email, uid, day, timeStart, timeEnd, location, locationLink) => {
    return workerUtils.addJob('slotConfirmEmail', {email: email,
                                               uid: uid,
                                               day: day,
                                               timeStart: timeStart,
                                               timeEnd: timeEnd,
                                               location: location,
                                               locationLink: locationLink});
}

module.exports.scheduleSignupEmail = (email) => {
    return workerUtils.addJob('signupEmail', {email: email});
}
