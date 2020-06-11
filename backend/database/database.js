const { verifyUserTable } = require('./userActions');
const { verifySessionTable } = require('./sessionActions');
const { verifySettingsTable } = require('./settingsActions');
const { verifyScheduleTable } = require('./scheduleActions');

module.exports.verifyTables = () => {
    return Promise.all([verifyUserTable(), verifySessionTable(), verifySettingsTable(), verifyScheduleTable()]);
}
