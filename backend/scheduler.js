// contains all the logic for scheduling people
const cron = require('node-cron');

const QUOTA = 100;
const TIME_INCREMENT = 10; // minutes
const START_TIME = 8; // hour
const END_TIME = 13; // hour
const PEOPLE_PER_INCREMENT = 3;

const task = cron.schedule('0 0 1,2,3,4,5 * *', () => {

}, {
    timezone: 'America/Los_Angeles'
});

const schedule = () => {
    // create new day
    // find next 100 people
    // assign them to day
    // send out notifications
}

module.exports.startScheduler = () => {
    task.start();
}
