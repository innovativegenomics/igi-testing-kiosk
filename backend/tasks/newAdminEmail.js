module.exports = async (payload, helpers) => {
  process.env.TZ = 'America/Los_Angeles';
  const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
  const { sendEmail } = require('../email');

  const config = require('../config/keys');

  const { email, uid } = payload;
  await sendEmail(email,
    `IGI FAST - New Admin Confirmation`,
    `<h3>Congrats! You are now an administrator for IGI FAST!</h3>
    <p>Please create your account at this link: <a href='${config.host}/api/admin/login?returnTo=${encodeURIComponent(config.host+'/api/admin/login?uid='+uid)}'>Create Account</a></p>`,
    undefined,
    pino
    );
}
