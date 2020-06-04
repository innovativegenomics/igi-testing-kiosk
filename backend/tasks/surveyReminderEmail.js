module.exports = (payload, helpers) => {
    const nodemailer = require('nodemailer');

    const config = require('../config/keys');
    const { getUserByID } = require('../database/userActions');

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email.user,
            pass: config.email.pass
        }
    });

    const { calnetid } = payload;
    return getUserByID(calnetid).then(user => {
        if(user.alertemail) {
            return transport.sendMail({
                from: config.email.user,
                to: user.email,
                subject: `Reminder to take screening questionaire`,
                // text: 'Please enable html messages to view this email',
                html: `<h1>Reminder to take screening questionaire</h1>
                       <h2>You must take the screening questionaire four or less hours before your test. You can access the survey in your <a href='${config.host}'>IGI Healthy Campus account<a></h2>`,
            });
        } else {
            return false;
        }
    });
}
