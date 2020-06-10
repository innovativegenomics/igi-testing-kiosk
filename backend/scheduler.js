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
