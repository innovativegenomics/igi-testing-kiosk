module.exports = async (payload, helpers) => {
  process.env.TZ = 'America/Los_Angeles';
  const sendEmail = require('../email');

  const config = require('../config/keys');

  const { email } = payload;
  await sendEmail(email,
                  `IGI FAST - Signup Confirmation`,
                  `<h3>Thank you for signing up for the IGI Healthy Campus Study!</h3>
                  <p>You can read more about our program on our website <a href='${config.host}'>here</a>.
                  Attached to this email is the informed consent and bill of rights for this study. The study info sheet is also attached.</p>`,
                  [
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
                  ]);
}
