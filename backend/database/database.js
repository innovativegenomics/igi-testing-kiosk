const { verifyUserTable } = require('./userActions');
const { verifySessionTable } = require('./sessionActions');
const { verifySettingsTable } = require('./settingsActions');

module.exports.verifyTables = () => {
    return Promise.all([verifyUserTable(), verifySessionTable(), verifySettingsTable()]);
}
