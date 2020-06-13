const { verifyUserTable } = require('./userActions');
const { verifySessionTable } = require('./sessionActions');
const { verifySettingsTable } = require('./settingsActions');
const { verifyScheduleTable } = require('./scheduleActions');
const { verifyAdminTable } = require('./adminActions');

module.exports.verifyTables = () => {
    return Promise.all([verifyUserTable(), verifySessionTable(), verifySettingsTable(), verifyScheduleTable(), verifyAdminTable()]);
}
