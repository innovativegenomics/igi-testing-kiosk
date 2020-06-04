module.exports = (payload, helpers) => {
    const { Pool } = require('pg');
    const moment = require('moment');
    const { makeWorkerUtils } = require('graphile-worker');

    const { scheduleOpenSlotText, scheduleOpenSlotEmail } = require('../scheduler');

    const { updateUserSchedules } = require('../database/scheduleActions');
    const { getUsersByID } = require('../database/userActions');

    const pool = new Pool({
        user: require('../config/keys').pg.pguser,
        host: require('../config/keys').pg.pghost,
        database: require('../config/keys').pg.pgdatabase,
        password: require('../config/keys').pg.pgpassword,
        port: require('../config/keys').pg.pgport,
    });
    return Promise.resolve(0).then(r => {
        return updateUserSchedules(currentDate.toDate()).then(res => getUsersByID(res.map(x => x.calnetid))).then(users => {
            // result is list of users
            // send out emails based on preferences
            const promises = [];
            for(var u of users) {
                const day = moment(u.nextappointment);
                if(u.alertemail) {
                    promises.push(scheduleOpenSlotEmail(u.email, day.format('dddd, MMMM DD')));
                }
                if(u.alertphone && !!u.phone) {
                    promises.push(scheduleOpenSlotText(u.phone, day.format('dddd, MMMM DD')));
                }
            }
            return Promise.all(promises);
        });
    }).then(r => {
        return makeWorkerUtils({pgPool: pool});
    }).then(res => {
        return res.addJob('addRescheduleUsers', {}, {queueName: 'rescheduleQueue', jobKey:'addRescheduleJob'}).then(r => res.release()).then(r => pool.end());
    })
}
