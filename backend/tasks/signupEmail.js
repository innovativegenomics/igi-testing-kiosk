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

    const { email } = payload;
    return transport.sendMail({
        from: config.email.user,
        to: email,
        subject: `IGI Healthy Campus Initiative`,
        // text: 'Please enable html messages to view this email',
        html: `<h3>Thank you for signing up for the IGI Healthy Campus Initiative!</h3>
                <p>You can read more about our program on our website <a href='https://igistudy.berkeley.edu/about'>here</a></p>`,
    });
}
