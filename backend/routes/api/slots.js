const express = require('express');
const router = express.Router();
// const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const moment = require('moment');

const { sequelize, Sequelize, Slot, User, Day, ReservedSlot, OpenTime, Settings, Location } = require('../../models');
const { scheduleSlotConfirmEmail,
  scheduleSlotConfirmText,
  scheduleAppointmentReminderEmail,
  scheduleAppointmentReminderText,
  scheduleResultInstructionsEmail, 
  deleteAppointmentReminders,} = require('../../worker');
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
  const t = await sequelize.transaction({logging: (msg) => request.log.info(msg)});
  try {
    const user = await User.findOne({
      where: {
        calnetid: calnetid
      },
      transaction: t,
      logging: (msg) => request.log.info(msg)
    });
    console.log(user);
    const availableWhere = {
      starttime: {
        [Op.gte]: moment(user.availableStart||undefined).toDate()
      }
    };
    if(user.availableEnd) {
      availableWhere.starttime[Op.lt] = moment(user.availableEnd).toDate();
    }
    if(moment(user.availableStart).isBefore(moment())) {
      availableWhere.starttime[Op.gte] = moment().toDate();
    }
    const availableRaw = await OpenTime.findAll({
      where: {
        ...availableWhere,
        available: {
          [Op.gt]: 0
        }
      },
      include: {
        model: Location
      },
      order: [['starttime', 'asc']],
      transaction: t,
      logging: (msg) => request.log.info(msg)
    });

    const available = {};
    const locations = {};
    const fmtDays = [];
    let lastTime;
    let lastIndex;
    availableRaw.forEach(v => {
      if(!available[v.date]) {
        available[v.date] = {
          locations: [],
          slots: []
        };
        fmtDays.push(v.date);
        lastTime = null;
        lastIndex = -1;
      }
      if (!available[v.date].locations.includes(v.Location.name)) {
        available[v.date].locations.push(v.Location.name);
      }
      if(!locations[v.Location.name]) {
        locations[v.Location.name] = v.Location.map;
      }
      if(!moment(v.starttime).isSame(lastTime)) {
        lastIndex = lastIndex + 1;
        lastTime = moment(v.starttime);
        available[v.date].slots.push({
          time: lastTime.clone(),
          locations: []
        });
      }
      available[v.date].slots[lastIndex].locations.push(v.Location.name);
    });

    await t.commit();
    response.send({ success: true, available: available, locations: locations, days: fmtDays });
  } catch (err) {
    request.log.error(`Can't get available slots for user ${calnetid}`);
    request.log.error(err);
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
    const settings = await Settings.findOne({});
    const slot = await Slot.findOne({
      attributes: ['location', 'time', 'uid', 'completed'],
      where: { calnetid: calnetid, current: true },
      logging: (msg) => request.log.info(msg)
    });
    response.json({ success: true, slot: {
      location: slot.location,
      time: slot.time,
      uid: slot.uid,
      completed: slot.completed,
      locationlink: settings.locationlinks[settings.locations.indexOf(slot.location)]
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
    logging: (msg) => request.log.info(msg)
  });
  try {
    const reqtime = moment(request.body.time);
    const reqlocation = request.body.location;
    const questions = request.body.questions;
    const settings = await Settings.findOne({transaction: t, logging: (msg) => request.log.info(msg)});
    const slot = await Slot.findOne({
      where: { calnetid: calnetid, current: true },
      transaction: t,
      logging: (msg) => request.log.info(msg)
    });
    const day = await Day.findOne({
      where: {
        date: {
          [Op.gte]: reqtime.clone().startOf('day').toDate(),
          [Op.lt]: reqtime.clone().startOf('day').add(1, 'day').toDate()
        }
      },
      transaction: t,
      logging: (msg) => request.log.info(msg)
    });

    if(!day) {
      throw new Error('no matching day found!');
    }

    if(!moment(slot.time).startOf('week').isSame(reqtime.clone().startOf('week'))) {
      throw new Error('slot not valid');
    } else if(!settings.locations.includes(reqlocation)) {
      throw new Error('location not valid');
    }
    

    else if(moment.duration(reqtime.diff(reqtime.clone().set('hour', day.starthour).set('minute', day.startminute))).asMinutes() % day.window > 0) {
      throw new Error('slot not valid');
    } else if(!reqtime.isBetween(reqtime.clone().set('hour', day.starthour).set('minute', day.startminute), reqtime.clone().set('hour', day.endhour).set('minute', day.endminute), null, '[)')) {
      throw new Error('slot not valid');
    }
    
    else if(reqtime.isBefore(moment())) {
      throw new Error('slot is before current time');
    } else if(slot.completed) {
      throw new Error('slot is already completed');
    }

    const takenCount = (await Slot.count({
      where: {
        time: reqtime.toDate(),
        location: reqlocation,
      },
      transaction: t,
      logging: (msg) => request.log.info(msg)
    })) + (await ReservedSlot.count({
      where: {
        calnetid: {
          [Op.ne]: calnetid,
        },
        time: reqtime.toDate(),
        location: reqlocation,
        expires: {
          [Op.gt]: moment().toDate()
        }
      },
      transaction: t,
      logging: (msg) => request.log.info(msg)
    }));
    if(takenCount >= day.buffer) {
      throw new Error('Slot is already full');
    } else {
      try {
        await (await ReservedSlot.findOne({
          where: {
            calnetid: calnetid
          },
          transaction: t,
          logging: (msg) => request.log.info(msg)
        })).destroy();
      } catch(err) {
        // No slot for the given user
        request.log.debug(`Can't delete reserved slot for user ${calnetid}`);
        request.log.debug(err);
      }

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
        const user = await User.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)});
        await scheduleSlotConfirmEmail({
          calnetid: calnetid,
          uid: slot.uid,
          time: moment(slot.time),
          location: slot.location
        });
        await scheduleAppointmentReminderEmail({
          calnetid: calnetid,
          time: moment(slot.time),
          uid: slot.uid
        });
        if(!user.accessresultssent) {
          await scheduleResultInstructionsEmail({
            calnetid: calnetid
          });
          user.accessresultssent = true;
          await user.save();
        }
        await scheduleSlotConfirmText({
          calnetid: calnetid,
          uid: slot.uid,
          time: moment(slot.time),
          location: slot.location
        });
        await scheduleAppointmentReminderText({
          calnetid: calnetid,
          time: moment(slot.time),
          uid: slot.uid
        });
      } catch(err) {
        request.log.error(`Can't schedule confirm notifications for user ${calnetid}`);
        request.log.error(err);
      }
    }
  } catch(err) {
    request.log.error(`Can't set slot for user ${calnetid}`);
    request.log.error(err);
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
  const t = await sequelize.transaction({logging: (msg) => request.log.info(msg)});
  try {
    const slot = await Slot.findOne({
      where: { calnetid: calnetid, current: true },
      transaction: t,
      logging: (msg) => request.log.info(msg)
    });
    if (!slot.completed) {
      slot.location = null;
      slot.scheduled = null;
      slot.time = moment(slot.time).startOf('week').toDate();
      await slot.save();
      const user = await User.findOne({
        where: {
          calnetid: calnetid
        },
        transaction: t,
        logging: (msg) => request.log.info(msg)
      });
      try {
        await deleteAppointmentReminders(calnetid);
      } catch(err) {
        request.log.error(`Couldn't delete appointment reminders for user ${calnetid}`);
        request.log.error(err);
      }
      response.send({ success: true });
    } else {
      response.send({ success: false });
    }
    await t.commit();
  } catch (err) {
    request.log.error(`Can't cancel appointment for user ${calnetid}`);
    request.log.error(err);
    await t.rollback();
    response.send({ success: false });
  }
});

router.post('/reserve', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  request.log.debug(request.body);
  const time = moment(request.body.time);
  const location = request.body.location;
  if(!!time && !!location) {
    const t = await sequelize.transaction({
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
      logging: (msg) => request.log.info(msg)
    });
    try {
      const settings = await Settings.findOne({transaction: t, logging: (msg) => request.log.info(msg)});
      const day = await Day.findOne({
        where: {
          date: time.clone().startOf('day').toDate()
        },
        transaction: t,
        logging: (msg) => request.log.info(msg)
      });
      const taken = (await Slot.count({
        where: {
          location: location,
          time: time.toDate(),
        },
        transaction: t,
        logging: (msg) => request.log.info(msg)
      })) + (await ReservedSlot.count({
        where: {
          calnetid: {
            [Op.ne]: calnetid
          },
          time: time.toDate(),
          location: location,
          expires: {
            [Op.gt]: moment().toDate()
          }
        },
        transaction: t,
        logging: (msg) => request.log.info(msg)
      }));
      request.log.debug(`${taken}`);
      if(taken < day.buffer) {
        await ReservedSlot.upsert({
          calnetid: calnetid,
          time: time.toDate(),
          location: location,
          expires: moment().add(settings.ReservedSlotTimeout, 'seconds').toDate(),
        }, {transaction: t, logging: (msg) => request.log.info(msg)});
        response.send({success: true});
      } else {
        response.send({success: false});
      }
      await t.commit();
    } catch(err) {
      request.log.error(`couldn't create reservation for user ${calnetid}`);
      request.log.error(err);
      await t.rollback();
      response.send({success: false});
    }
  } else {
    request.log.info(`Invalid request`);
    response.status(400).send();
  }
});

router.delete('/reserve', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  try {
    await (await ReservedSlot.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).destroy();
    response.send({success: true});
  } catch(err) {
    request.log.error(`couldn't delete reservation for user ${calnetid}`);
    request.log.error(err);
    response.send({success: false});
  }
});

module.exports = router;
