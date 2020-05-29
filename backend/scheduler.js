// contains all the logic for scheduling people
const cron = require('node-cron');
const moment = require('moment');
const { Settings } = require('./database/settingsActions');
const { getUsersByID } = require('./database/userActions');
const { updateUserSchedules } = require('./database/scheduleActions');
const { sendOpenSlotEmail, sendOpenSlotText } = require('./messager');

const task = cron.schedule('1 0 * * *', () => { // run at 12:01 AM every day
    schedule();
}, {
    timezone: 'America/Los_Angeles',
    scheduled: false
});

const schedule = () => {
    const currentDate = moment();
    return updateUserSchedules(currentDate.toDate()).then(res => getUsersByID(res.map(x => x.calnetid))).then(users => {
        // result is list of users
        // send out emails based on preferences
        const promises = [];
        for(var u of users) {
            const day = moment(u.nextappointment);
            if(u.alertemail) {
                promises.push(sendOpenSlotEmail(u.email, day.format('dddd, MMMM DD')));
            }
            if(u.alertphone) {
                promises.push(sendConfirmText(u.phone, day.format('dddd, MMMM DD')));
            }
        }
        return Promise.all(promises);
    });
}

module.exports.startScheduler = () => {
    task.start();
}
