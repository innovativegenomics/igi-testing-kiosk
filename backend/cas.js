const CASAuthentication = require('cas-authentication');

const casOptions = {
    cas_url         : (/*(process.env.NODE_ENV === 'production')*/false ? 'https://auth.berkeley.edu/cas' : 'https://auth-test.berkeley.edu/cas'),
    service_url     : 'https://kiosk.andycate.com',
    cas_version     : '3.0',
    renew           : false,
    is_dev_mode     : /*(process.env.NODE_ENV !== 'production')*/true,
    dev_mode_user   : 'andycate',
    dev_mode_info   : {},
    session_name    : 'cas_user',
    session_info    : 'cas_userinfo',
    destroy_session : false
};

const Cas = new CASAuthentication(casOptions);

module.exports = Cas;
