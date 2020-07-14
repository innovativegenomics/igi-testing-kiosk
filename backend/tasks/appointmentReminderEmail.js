module.exports = async (payload, helpers) => {
  process.env.TZ = 'America/Los_Angeles';
  const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
  const moment = require('moment');
  const { sendEmail } = require('../email');

  const { email, time } = payload;
  await sendEmail(email,
    `IGI FAST - Appointment Reminder for ${moment(time).format('h:mm A')}`,
    `<h3>You have an upcoming appointment at ${moment(time).format('h:mm A')}!</h3>
      <p>Please remember not to:</p>
      <ul>
        <li>Eat</li>
        <li>Drink</li>
        <li>Smoke</li>
        <li>Chew gum</li>
      </ul>
      <p>30 minutes before your appointment. Thanks!</p>
      <p>Make sure to wear your mask and bring your QR code, which you received in your appointment confirmation email.</p>
      <p>View your appointment by logging into our website at <a href='https://igi-fast.berkeley.edu'>igi-fast.berkeley.edu</a></p>`,
      undefined,
      pino);
}
