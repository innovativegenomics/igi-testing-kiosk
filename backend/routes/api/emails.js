const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');

router.get('/qrimg', async (request, response) => {
  const url = await QRCode.toDataURL(request.query.uid);
  response.header('Content-Type', 'image/png');
  response.send(Buffer.from(url.split('base64,')[1], 'base64'));
});

module.exports = router;
