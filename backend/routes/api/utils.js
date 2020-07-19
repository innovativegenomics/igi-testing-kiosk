const express = require('express');
const router = express.Router();
const axios = require('axios');

let siteKey;
if(process.env.NODE_ENV !== 'production') {
  siteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
} else {
  siteKey = require('../../config/keys').recaptcha.siteKey;
}

/**
 * Quick and dirty way for the frontend to know if the server is dev mode
 */
router.get('/devmode', (request, response) => {
  response.json({ devmode: (process.env.NODE_ENV !== 'production') });
});

router.get('/recaptcha', async (request, response) => {
  const r = await axios.get(`https://www.google.com/recaptcha/api.js?render=${siteKey}`);
  response.setHeader('Content-Type', 'text/javascript');
  response.send(r.data);
});

router.get('/sitekey', (request, response) => {
  response.send({siteKey: siteKey});
});

module.exports = router;
