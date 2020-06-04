module.exports = (payload, helpers) => {
    const twilio = require('twilio');
    const config = require('../config/keys');
    const client = new twilio(config.twilio.accountSid,
                            config.twilio.authToken);

    const { number } = payload;
    return client.messages.create({
        body: `Remember to fill out the screening questionaire four or less hours before your appointment. You can access it in your IGI Healthy Campus account at ${config.host}`,
        to: number,
        from: config.twilio.sender
    });
}
