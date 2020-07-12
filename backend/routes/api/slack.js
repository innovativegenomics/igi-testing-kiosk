process.env.SLACK_SIGNING_SECRET = require('../../config/keys').slack.signingSecret;

const express = require('express');
const router = express.Router();
const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const crypto = require('crypto');
const moment = require('moment');
const chrono = require('chrono-node');

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

router.post('/appointments', async (request, response) => {
  pino.info('slack appointments request');
  if(verifySignature(request)) {
    pino.info('slack appointments signature verified');
    if(request.body.text === 'help') {
      response.send({
        response_type: 'ephemeral',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Try typing \`/appointments ${moment().format('MMMM Do')}\``
            }
          }
        ]
      });
      return;
    }
    try {
      const data = request.body.text;
      const date = chrono.casual.parseDate(data);
      if(!date) {
        response.send({
          response_type: 'ephemeral',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `Uh oh, it looks like you entered an invalid date! Try typing \`/appointments help\` for help.`
              }
            }
          ]
        });
        return;
      }
      if(data.toLowerCase().includes('week of')) {
        const mmt = moment(date).startOf('week');
        const days = await Day.findAll({
          where: {
            date: {
              [Op.gte]: mmt.toDate(),
              [Op.lt]: mmt.clone().add(1, 'week').toDate()
            }
          }
        });
        let total = 0;
        days.forEach(v => {
          total += v.buffer * parseInt(moment.duration({hours: v.endhour-v.starthour, minutes: v.endminute-v.startminute}).asMinutes()/v.window);
        });
        const count = await Slot.count({
          where: {
            time: {
              [Op.between]: [mmt.toDate(), mmt.clone().add(1, 'week').toDate()]
            }
          }
        });
        response.send({
          response_type: 'in_channel',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `There are ${count} appointments scheduled for the week of ${mmt.format('MMMM Do')} out of ${total} available for that week.`
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `The days available that week are ${days.map(v => moment(v.date).format('MMMM Do')).join(', ')}`
              }
            }
          ]
        });
        response.send(200);
      } else {
        const mmt = moment(date).startOf('day');
        const day = await Day.findOne({
          where: {
            date: mmt.toDate()
          }
        });
        if(!day) {
          response.send({
            response_type: 'ephemeral',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `Uh oh, it looks like ${mmt.format('MMMM Do')} isn't open for appointments!`
                }
              }
            ]
          });
          return;
        }
        const count = await Slot.count({
          where: {
            time: {
              [Op.between]: [mmt.toDate(), mmt.clone().add(1, 'day').toDate()]
            }
          }
        });
        const total = day.buffer * parseInt(moment.duration({hours: day.endhour-day.starthour, minutes: day.endminute-day.startminute}).asMinutes()/day.window);
        response.send({
          response_type: 'in_channel',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `There are ${count} appointments scheduled for ${mmt.format('MMMM Do')} out of ${total} available for that day`
              }
            }
          ]
        });
      }
    } catch(err) {
      pino.error(`error getting appointments for slack bot`);
      pino.error(err);
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
    pino.error('not verified');
    response.send(401);
  }
});

module.exports = router;
