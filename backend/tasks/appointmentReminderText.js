module.exports = async (payload, helpers) => {
  process.env.TZ = 'America/Los_Angeles';
  const twilio = require('twilio');
  const config = require('../config/keys');
  const client = new twilio(config.twilio.accountSid,
    config.twilio.authToken);

  const { number } = payload;
  await client.messages.create({
    body: `Reminder that you have an appointment in 30 minutes! 
Make sure not to eat, drink, smoke, or chew gum 30 minutes before your appointment!`,
    to: number,
    from: config.twilio.sender
  });
}
