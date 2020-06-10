module.exports = (payload, helpers) => {
    const twilio = require('twilio');
    const config = require('../config/keys');
    const client = new twilio(config.twilio.accountSid,
                            config.twilio.authToken);

    const { number, uid, day, timeStart, timeEnd, location, locationLink } = payload;
    const qrUrl = config.host + '/qrcode?uid=' + uid;
    return client.messages.create({
        body: `Testing Appointment Confirmation for ${day}
Please arrive between ${timeStart} and ${timeEnd} at location ${location}.
To view a map to this location, visit the following link ${locationLink}.
When you arrive, please present the QR code at the following link: ${qrUrl}.
Make sure to complete the screening questionaire 4 or less hours before your appointment.
To change or cancel this appointment, log into your testing account.`,
        to: number,
        from: config.twilio.sender
    });
}
