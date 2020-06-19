const express = require('express');
const router = express.Router();
const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const moment = require('moment');

const { sequelize, Sequelize, Slot, User, Settings } = require('../../models');
const { scheduleSlotConfirmEmail, scheduleSlotConfirmText, scheduleAppointmentReminderEmail, scheduleAppointmentReminderText } = require('../../scheduler');
const Op = Sequelize.Op;
const cas = require('../../cas');

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
          for (var i = week.clone().set('day', day).set('hour', settings.starttime).set('minute', settings.startminute); i.isBefore(i.clone().set('hour', settings.endtime).set('minute', settings.endminute)); i = i.add(settings.window, 'minute')) {
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
      attributes: ['location', 'time', 'uid', 'completed'],
      where: { calnetid: calnetid },
      order: [['time', 'desc']],
    }))[0];
    response.json({ success: true, slot: {
      location: slot.location,
      time: slot.time,
      uid: slot.uid,
      completed: slot.completed,
    }});
  } catch (err) {
    response.json({ success: false });
  }
});

/**
 * requests a slot for current user
 * request:
 * {
 *   location: string,
 *   time: Moment,
 *   questions: [],
 * }
 * response:
 * {success: true|false, error: undefined|[string]}
 */
router.post('/slot', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const t = await sequelize.transaction({
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  });
  try {
    const reqtime = moment(request.body.time);
    const reqlocation = request.body.location;
    const questions = request.body.questions;
    const settings = await Settings.findOne({transaction: t});
    const slot = (await Slot.findAll({
      limit: 1,
      where: { calnetid: calnetid },
      order: [['time', 'desc']],
      transaction: t,
    }))[0];

    if(!moment(slot.time).startOf('week').isSame(reqtime.clone().startOf('week'))) {
      throw new Error('slot not valid');
    } else if(!settings.locations.includes(reqlocation)) {
      throw new Error('location not valid');
    } else if(moment.duration(reqtime.diff(reqtime.clone().set('hour', settings.starttime).set('minute', settings.startminute))).asMinutes() % settings.window > 0) {
      throw new Error('slot not valid');
    } else if(!reqtime.isBetween(reqtime.clone().set('hour', settings.starttime).set('minute', settings.startminute), reqtime.clone().set('hour', settings.endtime).set('minute', settings.endminute), null, '[)')) {
      throw new Error('slot not valid');
    } else if(!settings.days.includes(reqtime.day())) {
      throw new Error('slot not valid');
    } else if(reqtime.isBefore(moment())) {
      throw new Error('slot is before current time');
    } else if(slot.completed) {
      throw new Error('slot is already completed');
    }

    const takenCount = await Slot.count({
      where: {
        time: reqtime.toDate(),
        location: reqlocation,
      },
      transaction: t,
    });
    if(takenCount >= settings.buffer) {
      throw new Error('Slot is already full');
    } else {
      slot.time = reqtime.toDate();
      slot.location = reqlocation;
      slot.scheduled = moment().toDate();
      slot.question1 = questions.question1;
      slot.question2 = questions.question2;
      slot.question3 = questions.question3;
      slot.question4 = questions.question4;
      slot.question5 = questions.question5;
      await slot.save();
      await t.commit();
      response.send({success: true});
      try {
        const user = await User.findOne({where: {calnetid: calnetid}});
        await scheduleSlotConfirmEmail(user.email, 
                                      slot.uid, 
                                      moment(slot.time).format('dddd'),
                                      moment(slot.time).format('h:mm A'),
                                      moment(slot.time).add(settings.window, 'minute').format('h:mm A'),
                                      slot.location,
                                      settings.locationlinks[settings.locations.indexOf(slot.location)]);
        await scheduleAppointmentReminderEmail(user.email, moment(slot.time));
        if(user.phone) {
          await scheduleSlotConfirmText(user.phone, 
                                        slot.uid, 
                                        moment(slot.time).format('dddd'),
                                        moment(slot.time).format('h:mm A'),
                                        moment(slot.time).add(settings.window, 'minute').format('h:mm A'),
                                        slot.location,
                                        settings.locationlinks[settings.locations.indexOf(slot.location)]);
          await scheduleAppointmentReminderText(user.phone, moment(slot.time));
        }
      } catch(err) {
        pino.error(`Can't schedule confirm notifications for user ${calnetid}`);
        pino.error(err);
      }
    }
  } catch(err) {
    pino.error(`Can't set slot for user ${calnetid}`);
    pino.error(err);
    await t.rollback();
    response.send({success: false});
  }
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
