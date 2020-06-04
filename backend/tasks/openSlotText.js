module.exports = (payload, helpers) => {
    const twilio = require('twilio');
    const config = require('../config/keys');
    const client = new twilio(config.twilio.accountSid,
                            config.twilio.authToken);

    const { number, day } = payload;
    return client.messages.create({
        body: `The next open testing day is ${day}. You can sign up for a time slot in your testing account.`,
        to: number,
        from: config.twilio.sender
    });
}
