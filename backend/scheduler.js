// contains all the logic for scheduling people
const cron = require('node-cron');
const moment = require('moment');
const { Settings } = require('./database/settingsActions');
const { updateUserSchedules, getUsersByID } = require('./database/userActions');

const task = cron.schedule('1 0 * * *', () => {
    schedule();
}, {
    timezone: 'America/Los_Angeles',
    scheduled: false
});

const schedule = () => {
    const currentDate = moment();
    updateUserSchedules(currentDate.toDate()).then(res => getUsersByID(res.map(x => x.calnetid))).then(res => {
        // res is list of users
        // send out emails based on preferences
    });
}

module.exports.startScheduler = () => {
    task.start();
}
