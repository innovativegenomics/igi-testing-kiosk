const express = require('express');
const router = express.Router();
const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const moment = require('moment');

const { sequelize, Sequelize, Slot, Settings } = require('../../models');
const Op = Sequelize.Op;
const cas = require('../../cas');
const { UserBindingContext } = require('twilio/lib/rest/chat/v2/service/user/userBinding');

/**
 * gets available slots
 * response:
 * {
 *   success: true,
 *   available: {
 *     locationname: {
 *       Moment: number,
 *       Moment: number,
 *     }
 *   }
 * }
 */
router.get('/available', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const t = await sequelize.transaction();
  try {
    const settings = await Settings.findOne({ transaction: t });
    const week = moment((await Slot.findAll({
      limit: 1,
      where: { calnetid: calnetid },
      attributes: ['time'],
      transaction: t,
    }))[0].time).startOf('week');
    const taken = await Slot.findAll({
      where: {
        location: {
          [Op.not]: null,
        },
        time: {
          [Op.between]: [week.toDate(), week.clone().add(1, 'week').toDate()]
        }
      },
      attributes: ['time', 'location'],
      transaction: t,
    });
    const now = moment();
    const open = {};
    for (var location of settings.locations) {
      open[location] = {};
      for (var day of settings.days) {
        if (now.isAfter(week.clone().set('day', day), 'day')) {
          continue;
        } else {
          for (var i = week.clone().set('day', day).set('hour', settings.starttime); i.get('hour') < settings.endtime; i = i.add(settings.window, 'minute')) {
            // pino.debug(`slot: ${i}`);
            if (i.isBefore(now)) {
              continue;
            } else {
              open[location][i.clone()] = settings.buffer;
            }
          }
        }
      }
    }
    for (var slot of taken) {
      if (open[slot.location][moment(slot.time)] !== undefined) {
        open[slot.location][moment(slot.time)]--;
      }
    }
    await t.commit();
    response.send({ success: true, available: open });
  } catch (err) {
    pino.error(`Can't get available slots for user ${calnetid}`);
    pino.error(err);
    await t.rollback();
    response.send({ success: false });
  }
});

/**
 * gets current user's slot
 * response:
 * {
 *   success: true,
 *   slot: {
 *     location: string,
 *     time: Moment,
 *     uid: string
 *   }
 * }
 */
router.get('/slot', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  try {
    const slot = (await Slot.findAll({
      limit: 1,
      attributes: ['location', 'time', 'uid'],
      where: { calnetid: calnetid },
      order: [['time', 'desc']],
    }))[0];
    response.json({ success: true, slot: slot });
  } catch (err) {
    response.json({ success: false });
  }
});

/**
 * requests a slot for current user
 * request:
 * {
 *   location: string,
 *   time: Moment
 * }
 * response:
 * {success: true|false}
 */
router.post('/slot', cas.block, async (request, response) => {

});

/**
 * requests current slot to be cancelled
 * response:
 * {success: true|false}
 */
router.delete('/slot', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const t = await sequelize.transaction();
  try {
    const slot = (await Slot.findAll({
      limit: 1,
      where: { calnetid: calnetid },
      order: [['time', 'desc']],
      transaction: t,
    }))[0];
    if (!slot.completed) {
      slot.location = null;
      slot.scheduled = null;
      slot.time = moment(slot.time).startOf('week').toDate();
      await slot.save();
      response.send({ success: true });
    } else {
      response.send({ success: false });
    }
    await t.commit();
  } catch (err) {
    pino.error(`Can't cancel appointment for user ${calnetid}`);
    pino.error(err);
    await t.rollback();
    response.send({ success: false });
  }
});

module.exports = router;
