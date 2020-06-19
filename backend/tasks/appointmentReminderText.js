module.exports = async (payload, helpers) => {
  process.env.TZ = 'America/Los_Angeles';
  const moment = require('moment');
  const twilio = require('twilio');
  const config = require('../config/keys');
  const client = new twilio(config.twilio.accountSid,
    config.twilio.authToken);

  const { number, time } = payload;
  await client.messages.create({
    body: `Reminder that you have a Covid 19 testing appointment in 30 minutes at ${moment(time).format('h:mm A')}! 
Make sure not to eat, drink, smoke, or chew gum 30 minutes before your appointment. Be sure to wear your mask, and bring the QR code you received. 
You can view your appointment by logging into <a href='https://igi-fast.berkeley.edu'>igi-fast.berkeley.edu</a>`,
    to: number,
    from: config.twilio.sender
  });
}
