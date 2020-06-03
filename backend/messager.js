const twilio = require('twilio');
const nodemailer = require('nodemailer');
const qrcode = require('qrcode');
const config = require('./config/keys');

const client = new twilio(config.twilio.accountSid,
                          config.twilio.authToken);

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
});

module.exports.sendOpenSlotText = (number, day) => {
    return client.messages.create({
        body: `The next open testing day is ${day}. You can sign up for a time slot in your testing account.`,
        to: number,
        from: config.twilio.sender
    });
}

module.exports.sendOpenSlotEmail = (email, day) => {
    return transport.sendMail({
        from: config.email.user,
        to: email,
        subject: `Next Open Testing day ${day}`,
        // text: 'Please enable html messages to view this email',
        html: `<h1>Next Open Testing day ${day}</h1>
               <h2>The next open testing day is ${day}. Please sign up for a time slot and location in your testing account.</h2>`,
    });
}

module.exports.sendConfirmText = (number, uid, day, timeStart, timeEnd, location, locationLink) => {
    const qrUrl = require('./config/keys').host + '/qrcode?uid=' + uid;
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

module.exports.sendConfirmEmail = (email, uid, day, timeStart, timeEnd, location, locationLink) => {
    const scanUrl = require('./config/keys').host + '/scanner?uid=' + uid;
    const qrUrl = require('./config/keys').host + '/qrcode?uid=' + uid;
    return qrcode.toDataURL(scanUrl).then(res => {
        return transport.sendMail({
            from: config.email.user,
            to: email,
            subject: `Testing Appointment Confirmation for ${day}`,
            // text: 'Please enable html messages to view this email',
            html: `<h1>Appointment Confirmation for ${day}</h1>
                   <h2>Please arrive at <a href='${locationLink}'>${location}</a> between ${timeStart} and ${timeEnd}</h2>
                   <h2>Bring your phone or another device to display the QR Code below</h2>
                   <h2>Make sure to complete the screening questionaire 4 or less hours before your appointment.</h2>
                   <b><img src="cid:qrcode" style='width: 100%; max-width: 450px;'/></b>
                   <br />
                   <h3>If the above QR code doesn't show correctly, go to <a href='${qrUrl}'>this</a> link</h3>`,
            attachments: [
                {
                    filename: 'qrcode.png',
                    content: res.split('base64,')[1],
                    encoding: 'base64',
                    cid: 'qrcode'
                }
            ]
        });
    });
    return Promise.resolve();
}
