module.exports = async (payload, helpers) => {
  process.env.TZ = 'America/Los_Angeles';
  const sendEmail = require('../email');
  const qrcode = require('qrcode');

  const config = require('../config/keys');

  const { email, uid, day, timeStart, timeEnd, location, locationLink } = payload;
  const scanUrl = config.host + '/admin/scanner?uid=' + uid;
  const qrUrl = config.host + '/qrcode?uid=' + uid;
  const qrData = await qrcode.toDataURL(scanUrl);
  await sendEmail(email,
                  `IGI FAST Appointment ${day}`,
                  `<h1>Appointment Confirmation for ${day}</h1>
                   <h2>Please arrive at <a href='${locationLink}'>${location}</a> between ${timeStart} and ${timeEnd}</h2>
                   <h2>Bring your phone or another device to display the QR Code below. You can also print it out.</h2>
                   <h2>Make sure to complete the <a href='https://calberkeley.ca1.qualtrics.com/jfe/form/SV_3xTgcs162K19qRv'>campus symptom screener</a> before coming to campus and arrive wearing a mask.</h2>
                   <h2>Do not eat, drink, chew gum, or smoke for 30 minutes prior to your appointment.</h2>
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
                      path: './media/infoSheetEnglish.pdf'
                    },
                    {
                      filename: 'IGI_study_info_sheet_Spanish.pdf',
                      path: './media/infoSheetSpanish.pdf'
                    },
                  ]);
}
