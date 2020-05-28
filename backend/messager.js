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

module.exports.sendConfirmText = (number, day, timeStart, timeEnd, location, locationLink) => {
    return client.messages.create({
        body: `Testing Appointment Confirmation for ${day}
Please arrive between ${timeStart} and ${timeEnd} at location ${location}.
To view a map to this location, visit the following link ${locationLink}.
To change or cancel this appointment, log into your testing account.`,
        to: number,
        from: config.twilio.sender
    });
}

module.exports.sendConfirmEmail = (email, uid, day, timeStart, timeEnd, location, locationLink) => {
    return qrcode.toDataURL(uid).then(res => {
        return transport.sendMail({
            from: config.email.user,
            to: email,
            subject: `Testing Appointment Confirmation for ${day}`,
            // text: 'Please enable html messages to view this email',
            html: `<h1>Appointment Confirmation for ${day}</h1>
                   <h2>Please arrive at <a href='${locationLink}'>${location}</a> between ${timeStart} and ${timeEnd}</h2>
                   <h2>Bring your phone or another device to display the QR Code below</h2>
                   <b><img src="cid:qrcode" width="300" height="300"/></b>
                   <br />
                   <b>If the above image doesn't show correctly, provide this reference number at the kiosk: ${uid}</b>`,
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
}
