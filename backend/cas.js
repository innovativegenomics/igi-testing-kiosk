const CASAuthentication = require('./thirdparty/casauth');

const casOptions = {
    cas_url         : ((process.env.NODE_ENV === 'production') ? 'https://auth.berkeley.edu/cas' : 'https://auth-test.berkeley.edu/cas'),
    service_url     : require('./config/keys').host,
    cas_version     : '3.0',
    renew           : false,
    is_dev_mode     : (process.env.NODE_ENV !== 'production'),
    dev_mode_user   : 'andycate',
    dev_mode_info   : {},
    session_name    : 'cas_user',
    session_info    : 'cas_userinfo',
    destroy_session : true
};

const cas = new CASAuthentication(casOptions);

module.exports = cas;
