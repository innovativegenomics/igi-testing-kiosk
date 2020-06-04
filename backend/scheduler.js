const { Pool } = require('pg');
const pool = new Pool({
    user: require('./config/keys').pg.pguser,
    host: require('./config/keys').pg.pghost,
    database: require('./config/keys').pg.pgdatabase,
    password: require('./config/keys').pg.pgpassword,
    port: require('./config/keys').pg.pgport,
});
const { makeWorkerUtils } = require('graphile-worker');
const moment = require('moment');

var workerUtils = undefined;

module.exports.verifyScheduler = () => {
    return makeWorkerUtils({pgPool: pool}).then(r => (workerUtils=r)).then(r => {
        return workerUtils.migrate();
    });
}

module.exports.setUpdateSchedulesTask = () => {
    return workerUtils.addJob('rescheduleUsers', {}, {runAt: moment().startOf('day').add(1, 'day').add(1, 'minute').toDate(), jobKey: 'rescheduleJob', queueName: 'rescheduleQueue'});
}

module.exports.scheduleConfirmText = (number, uid, day, timeStart, timeEnd, location, locationLink) => {
    return workerUtils.addJob('confirmText', {number: number,
                                              uid: uid,
                                              day: day,
                                              timeStart: timeStart,
                                              timeEnd: timeEnd,
                                              location: location,
                                              locationLink: locationLink});
}

module.exports.scheduleConfirmEmail = (email, uid, day, timeStart, timeEnd, location, locationLink) => {
    return workerUtils.addJob('confirmEmail', {email: email,
                                               uid: uid,
                                               day: day,
                                               timeStart: timeStart,
                                               timeEnd: timeEnd,
                                               location: location,
                                               locationLink: locationLink});
}

module.exports.scheduleOpenSlotText = (number, day) => {
    return workerUtils.addJob('openSlotText', {number: number, day: day});
}

module.exports.scheduleOpenSlotEmail = (email, day) => {
    return workerUtils.addJob('openSlotEmail', {email: email, day: day});
}

module.exports.scheduleSurveyReminderText = (calnetid, when) => {
    return workerUtils.addJob('surveyReminderText', {calnetid: calnetid}, {jobKey: calnetid+'surveyReminderText', runAt: when});
}

module.exports.scheduleSurveyReminderEmail = (calnetid, when) => {
    return workerUtils.addJob('surveyReminderEmail', {calnetid: calnetid}, {jobKey: calnetid+'surveyReminderEmail', runAt: when});
}

module.exports.clearSurveyReminderText = (calnetid) => {
    return pool.query(`select graphile_worker.remove_job($1)`, [calnetid+'surveyReminderText']);
}

module.exports.clearSurveyReminderEmail = (calnetid) => {
    return pool.query(`select graphile_worker.remove_job($1)`, [calnetid+'surveyReminderEmail']);
}
