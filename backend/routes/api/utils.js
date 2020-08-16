const express = require('express');
const router = express.Router();
const axios = require('axios');

const { User, Slot, Location, Sequelize } = require('../../models');
const Op = Sequelize.Op;

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

router.get('/participants', async (request, response) => {
  try {
    const count = await User.count({
      logging: (msg) => request.log.info(msg)
    });
    response.send({success: true, count: count});
  } catch(err) {
    response.status(500).send();
  }
});
router.get('/tests', async (request, response) => {
  try {
    const count = await Slot.count({
      where: {
        completed: {
          [Op.not]: null
        }
      },
      logging: (msg) => request.log.info(msg)
    });
    response.send({success: true, count: count});
  } catch(err) {
    response.status(500).send();
  }
});
router.get('/locations', async (request, response) => {
  try {
    const count = await Location.count({
      logging: (msg) => request.log.info(msg)
    });
    response.send({success: true, count: count});
  } catch(err) {
    response.status(500).send();
  }
});

module.exports = router;
