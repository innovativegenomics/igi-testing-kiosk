module.exports = async (payload, helpers) => {
  process.env.TZ = 'America/Los_Angeles';
  const sendEmail = require('../email');

  const config = require('../config/keys');

  const { email } = payload;
  const html = `
  <p>Dear IGI FAST Study Participant,</p>
  <p>
    Thank you for enrolling in the IGI FAST Study and making your first appointment. You will be receiving your
    results at this email using Virtru encryption. Please make sure to look for emails from <a href='mailto:igi-fast@berkeley.edu'>igi-fast@berkeley.edu</a>
    with the subject line “Your IGI FAST Study Result” each week you get tested.
  </p>
  <p>
    You may also receive a phone call from a blocked or unknown number if your sample tests positive or
    inconclusive.
  </p>
  <p>
    Virtru is an email encryption service we use to protect your data for this study. While it can be frustrating to
    have to go through extra steps to read the message, it is important that we protect your information. In most
    cases, you will only need to complete the below steps once. If you have cookies disabled or use alias emails,
    you may need to complete these steps multiple times.
  </p>
  <p>
    To see detailed instructions on accessing your results through the secure messaging system, please see <a href='https://igi-fast.berkeley.edu/accessing-results'>igi-fast.berkeley.edu/accessing-results</a>.
  </p>
  <p>
    For more questions, feel free to contact me or see the Virtru help center for instructions: <a href='https://support.virtru.com/hc/en-us/articles/115012284147'>https://support.virtru.com/hc/en-us/articles/115012284147</a>
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
                  `RE: Getting your IGI FAST results`,
                  html);
}
