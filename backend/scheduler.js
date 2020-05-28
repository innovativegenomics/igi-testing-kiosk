// contains all the logic for scheduling people
const cron = require('node-cron');
const moment = require('moment');
const { Settings } = require('./database/settingsActions');

const QUOTA = 100;
const TIME_INCREMENT = 10; // minutes
const START_TIME = 8; // hour
const END_TIME = 13; // hour
const PEOPLE_PER_INCREMENT = 3;

const task = cron.schedule('0 0 * * *', () => {
    setTimeout(schedule, 1000);
}, {
    timezone: 'America/Los_Angeles'
});

const schedule = () => {
    // create new day
    // find next 100 people
    // assign them to day
    // send out notifications
    const nextDay = moment().add(3, 'days');
    if(!Settings().days.includes(nextDay.day())) {
        console.log('Skiping today!');
        return;
    }
    const currentIndex = Settings().currentindex;
    getNextUsers(currentIndex, Settings().dayquota).then(res => {
        
    }).catch(err => {
        console.error('Problem creating new schedule!');
        console.error(err.stack);
    });
}

module.exports.startScheduler = () => {
    task.start();
}
