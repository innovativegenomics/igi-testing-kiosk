module.exports = async (payload, helpers) => {
  process.env.TZ = 'America/Los_Angeles';
  const sendEmail = require('../email');

  const { email } = payload;
  await sendEmail(email,
    `IGI FAST - 30 Minute Appointment Reminder`,
    `<h3>You have an upcoming appointment!</h3>
      <p>Please remember not to:</p>
      <ul>
        <li>Eat</li>
        <li>Drink</li>
        <li>Smoke</li>
        <li>Chew gum</li>
      </ul>
      <p>30 minutes before your appointment. Thanks!</p>`,
    );
}
