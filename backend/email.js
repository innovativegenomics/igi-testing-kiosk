const { Settings, sequelize } = require('./models');
// const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const nodemailer = require('nodemailer');

module.exports.sendEmail = async (email, subject, html, attachments, logger) => {
  try {
    const settings = await Settings.findOne({});
    const transport = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        type: 'OAuth2',
        user: require('./config/keys.js').email.user,
        clientId: require('./config/keys.js').email.clientId,
        clientSecret: require('./config/keys.js').email.clientSecret,
        refreshToken: settings.EmailRefreshToken,
        accessToken: settings.EmailAccessToken,
      },
    });
    transport.on('token', async token => {
      logger.info('New email access token generated');
      settings.EmailAccessToken = token.accessToken;
      await settings.save();
    });
    await transport.sendMail({
      from: `IGI FAST <${require('./config/keys.js').email.user}>`,
      to: email,
      subject: subject,
      // text: 'Please enable html messages to view this email',
      html: html,
      attachments: attachments,
    });
  } catch(err) {
    logger.error(`unable to send email to ${email}`);
    logger.error(err);
    return false;
  }
}

module.exports.sendRawEmail = async (message, logger) => {
  const settings = await Settings.findOne({});
  const transport = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
      type: 'OAuth2',
      user: require('./config/keys.js').email.user,
      clientId: require('./config/keys.js').email.clientId,
      clientSecret: require('./config/keys.js').email.clientSecret,
      refreshToken: settings.EmailRefreshToken,
      accessToken: settings.EmailAccessToken,
    },
  });
  transport.on('token', async token => {
    logger.info('New email access token generated');
    settings.EmailAccessToken = token.accessToken;
    await settings.save();
  });
  await transport.sendMail(message);
}
