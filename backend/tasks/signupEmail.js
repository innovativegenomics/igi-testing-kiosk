module.exports = async (payload, helpers) => {
  process.env.TZ = 'America/Los_Angeles';
  const sendEmail = require('../email');

  const config = require('../config/keys');

  const { email, name } = payload;
  const html = `
  <p>Dear ${name},</p>
  <p>
  Thank you for enrolling in the IGI Free Asymptomatic Saliva Testing (FAST) Study! You will now
have access to the scheduling application found at igi-fast.berkeley.edu. Each week you are
eligible to make an appointment, you will receive an email inviting you to schedule the day, time,
and location.
  </p>
  <p>
  Please see the attached informed consent text, medical research subjects’ bill of rights, and
instructions sheet. If you would prefer to download versions in Spanish please navigate to
<a href='https://igi-fast.berkeley.edu/about'>igi-fast.berkeley.edu/about</a>.
  </p>
  <p>
  If you have any questions, please feel free to contact me at <a href='mailto:igi-fast@berkeley.edu'>igi-fast@berkeley.edu</a>.
  </p>
  <p>Sincerely,</a>
  <p>Alexander Ehrenberg</p>
  <p>
    --
    <br />
    <b>Alexander Ehrenberg</b>
    <br />
    Study Coordinator
    <br />
    IGI FAST Study
    <br />
    <a href='https://igi-fast.berkeley.edu'>igi-fast.berkeley.edu</a>
  </p>
  <p>
    <b>IGI Campus Recovery Initiative</b>
    <br />
    Innovative Genomics Institute
    <br />
    University of California, Berkeley
    <br />
    <a href='https://innovativegenomics.org/campus-recovery'>innovativegenomics.org/campus-recovery</a>
  </p>
  <img src='cid:logo' style='width:30%' />
  <p>
    CONFIDENTIALITY NOTICE: This e-mail message, including any attachments, is for the sole use of the intended recipient(s) and
may contain confidential and privileged information protected by law. Any unauthorized review, use, disclosure or distribution is
prohibited. If you are not the intended recipient, please contact the sender by reply e-mail and destroy all copies of the original
message.
  </p>
  `;
  await sendEmail(email,
                  `IGI FAST Study Enrollment`,
                  html,
                  [
                    {
                      filename: 'IGI_study_info_sheet.pdf',
                      path: './media/infoSheetEnglish.pdf'
                    },
                    {
                      filename: 'Informed_Consent_20200610.pdf',
                      path: './media/informedConsentEnglish.pdf'
                    },
                    {
                      filename: 'IGI_Healthy_Campus_Study_Bill_of_Rights.pdf',
                      path: './media/billOfRightsEnglish.pdf'
                    },
                    {
                      filename: 'logo.png',
                      path: './media/IGI-FAST.png',
                      cid: 'logo',
                    }
                  ]);
}
