const CASAuthentication = require('./thirdparty/casauth');

const casOptions = {
    cas_url         : ((process.env.NODE_ENV === 'production') ? 'https://auth.berkeley.edu/cas' : 'https://auth-test.berkeley.edu/cas'),
    service_url     : 'https://kiosk.andycate.com',
    cas_version     : '3.0',
    renew           : false,
    is_dev_mode     : (process.env.NODE_ENV !== 'production'),
    dev_mode_user   : 'andycate',
    dev_mode_info   : {},
    session_name    : 'cas_user',
    session_info    : 'cas_userinfo',
    destroy_session : true
};

const Cas = new CASAuthentication(casOptions);

module.exports = Cas;
