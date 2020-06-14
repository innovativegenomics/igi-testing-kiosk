module.exports = async (payload, helpers) => {
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
    await transport.sendMail({
        from: config.email.user,
        to: email,
        subject: `IGI Healthy Campus Study`,
        // text: 'Please enable html messages to view this email',
        html: `<h3>Thank you for signing up for the IGI Healthy Campus Study!</h3>
                <p>You can read more about our program on our website <a href='https://igistudy.berkeley.edu/about'>here</a>.
                Attached to this email is the informed consent and bill of rights for this study. The study info sheet is also attached.</p>`,
        attachments: [
            {
                filename: 'IGI_study_info_sheet.pdf',
                path: './media/IGI_study_info_sheet.pdf'
            },
            {
                filename: 'Informed_Consent_20200610.pdf',
                path: './media/Informed_Consent_20200610.pdf'
            },
            {
                filename: 'IGI_Healthy_Campus_Study_Bill_of_Rights.pdf',
                path: './media/IGI_Healthy_Campus_Study_Bill_of_Rights.pdf'
            }
        ]
    });
}
