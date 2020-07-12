process.env.SLACK_SIGNING_SECRET = require('../../config/keys').slack.signingSecret;

const express = require('express');
const router = express.Router();
const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const crypto = require('crypto');

const { Sequelize, sequelize, Admin, Slot, User, Day, Settings } = require('../../models');
const Op = Sequelize.Op;

const verifySignature = req => {
  try {
    const signature = req.headers['x-slack-signature'];
    const timestamp = req.headers['x-slack-request-timestamp'];
    const hmac = crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET);
    const [version, hash] = signature.split('=');

    hmac.update(`${version}:${timestamp}:${req.rawBody}`);

    return hmac.digest('hex') === hash;
  } catch(err) {
    return false;
  }
};

router.post('/participants', async (request, response) => {
  pino.info('slack participant request');
  if(verifySignature(request)) {
    pino.info('slack participant signature verified');
    try {
      const count = await User.count({});
      response.send({
        response_type: 'in_channel',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `There are currently ${count} participants enrolled!`
            }
          }
        ]
      });
    } catch(err) {
      response.send({
        response_type: 'ephemeral',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Uh oh! There was a problem with the command. Please try again...`
            }
          }
        ]
      });
    }
  } else {
    console.log('not verified')
    response.send(401);
  }
});

module.exports = router;
