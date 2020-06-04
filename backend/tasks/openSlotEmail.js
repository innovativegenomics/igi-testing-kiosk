module.exports = (payload, helpers) => {
    const nodemailer = require('nodemailer');

    const config = require('../config/keys');

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email.user,
            pass: config.email.pass
        }
    });

    const { email, day } = payload;
    return transport.sendMail({
        from: config.email.user,
        to: email,
        subject: `Next Open Testing day ${day}`,
        // text: 'Please enable html messages to view this email',
        html: `<h1>Next Open Testing day ${day}</h1>
               <h2>The next open testing day is ${day}. Please sign up for a time slot and location in your testing account.</h2>`,
    });
}
