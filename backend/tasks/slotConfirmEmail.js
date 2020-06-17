module.exports = async (payload, helpers) => {
  process.env.TZ = 'America/Los_Angeles';
  const sendEmail = require('../email');
  const qrcode = require('qrcode');

  const config = require('../config/keys');

  const { email, uid, day, timeStart, timeEnd, location, locationLink } = payload;
  const scanUrl = config.host + '/scanner?uid=' + uid;
  const qrUrl = config.host + '/qrcode?uid=' + uid;
  const qrData = await qrcode.toDataURL(scanUrl);
  await sendEmail(email,
                  `Testing Appointment Confirmation for ${day}`,
                  `<h1>Appointment Confirmation for ${day}</h1>
                   <h2>Please arrive at <a href='${locationLink}'>${location}</a> between ${timeStart} and ${timeEnd}</h2>
                   <h2>Bring your phone or another device to display the QR Code below</h2>
                   <h2>Make sure to complete the screening questionaire 4 or less hours before your appointment.</h2>
                   <b><img src="cid:qrcode" style='width: 100%; max-width: 450px;'/></b>
                   <br />
                   <h3>If the above QR code doesn't show correctly, go to <a href='${qrUrl}'>this</a> link</h3>`,
                   [
                    {
                      filename: 'qrcode.png',
                      content: qrData.split('base64,')[1],
                      encoding: 'base64',
                      cid: 'qrcode'
                    },
                    {
                      filename: 'IGI_study_info_sheet.pdf',
                      path: './media/IGI_study_info_sheet.pdf'
                    },
                  ]);
}
