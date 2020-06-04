module.exports = (payload, helpers) => {
    const twilio = require('twilio');
    const config = require('../config/keys');
    const client = new twilio(config.twilio.accountSid,
                            config.twilio.authToken);
    
    const { getUserByID } = require('../database/userActions');

    const { calnetid } = payload;
    return getUserByID(calnetid).then(user => {
        if(user.alertphone && !!user.phone) {
            return client.messages.create({
                body: `Remember to fill out the screening questionaire four or less hours before your appointment. You can access it in your IGI Healthy Campus account at ${config.host}`,
                to: user.phone,
                from: config.twilio.sender
            });
        } else {
            return false;
        }
    });
}
