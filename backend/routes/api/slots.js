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
      attributes: {
        include: [[Sequelize.cast(Sequelize.fn('COUNT', Sequelize.col('ReservedSlots.id')), 'INTEGER'), 'reservedCount']]
      },
      include: [
        {
          model: Location,
        }, 
        {
          model: ReservedSlot,
          attributes: [],
          where: {
            calnetid: {
              [Op.ne]: calnetid
            },
            expires: {
              [Op.gt]: moment().toDate()
            }
          },
          required: false
        }
      ],
      group: ['OpenTime.id', 'Location.id'],
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
      if(v.available-v.reservedCount < 1) {
        return;
      }
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
      include: [{
        model: OpenTime,
        include: Location
      }],
      logging: (msg) => request.log.info(msg)
    });
    response.json({ success: true, slot: slot});
  } catch (err) {
    request.log.error('error getting slot');
    request.log.error(err.stack);
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
    const reqlocation = await Location.findOne({
      where: {
        name: request.body.location
      },
      transaction: t,
      logging: (msg) => request.log.info(msg)
    });
    if(!reqlocation) {
      throw new Error(`location name is invalid`);
    }

    const questions = request.body.questions;
    const openTime = await OpenTime.findOne({
      where: {
        starttime: reqtime.toDate(),
        location: reqlocation.id
      },
      attributes: {
        include: [[Sequelize.cast(Sequelize.fn('COUNT', Sequelize.col('ReservedSlots.id')), 'INTEGER'), 'reservedCount']]
      },
      include: [
        {
          model: ReservedSlot,
          attributes: [],
          where: {
            calnetid: {
              [Op.ne]: calnetid
            },
            expires: {
              [Op.gt]: moment().toDate()
            }
          },
          required: false,
          duplicating: false
        }
      ],
      group: ['OpenTime.id'],
      transaction: t,
      logging: (msg) => request.log.info(msg)
    });
    request.log.debug('after query');

    if(!openTime) {
      throw new Error(`Specified time is not open`);
    }
    if(openTime.available-openTime.reservedCount < 1) {
      throw new Error(`No more available slots for ${reqlocation.id} at ${reqtime.format()}`);
    }
    let slot = await Slot.findOne({
      where: { calnetid: calnetid, current: true },
      transaction: t,
      logging: (msg) => request.log.info(msg)
    });
    if(slot) {
      if(slot.completed) {
        throw new Error(`Current appointment already completed`);
      }
      slot.time = reqtime.toDate();
      slot.location = reqlocation.id;
      slot.scheduled = moment().toDate();
      slot.question1 = questions.question1;
      slot.question2 = questions.question2;
      slot.question3 = questions.question3;
      slot.question4 = questions.question4;
      slot.question5 = questions.question5;
      openTime.available -= 1;
      await slot.save();
      await openTime.save();
    } else {
      slot = await openTime.createSlot({
        calnetid: calnetid,
        time: reqtime.toDate(),
        scheduled: moment().toDate(),
        location: reqlocation.id,
        current: true,
        question1: questions.question1,
        question2: questions.question2,
        question3: questions.question3,
        question4: questions.question4,
        question5: questions.question5,
      });
      openTime.available -= 1;
      await openTime.save();
    }
    await ReservedSlot.destroy({
      where: {
        calnetid: calnetid
      },
      transaction: t,
      logging: (msg) => request.log.info(msg)
    });

    const user = await User.findOne({
      where: {
        calnetid: calnetid
      },
      transaction: t,
      logging: (msg) => request.log.info(msg)
    });
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

    await t.commit();
    response.send({success: true});
  } catch(err) {
    await t.rollback();
    request.log.error(`error scheduling slot`);
    request.log.error(err.stack);
    response.send({success: false});
  };
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
      include: OpenTime,
      transaction: t,
      logging: (msg) => request.log.info(msg)
    });
    if (!slot.completed) {
      slot.OpenTime.available += 1;
      await slot.OpenTime.save();
      await slot.destroy();
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
  try {
    const t = await sequelize.transaction({
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
      logging: (msg) => request.log.info(msg)
    });
    const time = moment(request.body.time);
    const location = await Location.findOne({
      where: {
        name: request.body.location
      },
      transaction: t,
      logging: (msg) => request.log.info(msg)
    });
    const settings = await Settings.findOne({transaction: t, logging: (msg) => request.log.info(msg)});
    const openTime = await OpenTime.findOne({
      where: {
        starttime: time.toDate(),
        location: location.id
      },
      attributes: {
        include: [[Sequelize.cast(Sequelize.fn('COUNT', Sequelize.col('ReservedSlots.id')), 'INTEGER'), 'reservedCount']]
      },
      include: [
        {
          model: ReservedSlot,
          attributes: [],
          where: {
            calnetid: {
              [Op.ne]: calnetid
            },
            expires: {
              [Op.gt]: moment().toDate()
            }
          },
          required: false,
          duplicating: false
        }
      ],
      group: ['OpenTime.id'],
      transaction: t,
      logging: (msg) => request.log.info(msg)
    });
    if(openTime.available-openTime.reservedCount < 1) {
      throw new Error(`No more open slots for this time and location`);
    }
    await ReservedSlot.upsert({
      calnetid: calnetid,
      time: time.toDate(),
      location: location.id,
      OpenTimeId: openTime.id,
      expires: moment().add(settings.ReservedSlotTimeout, 'seconds').toDate(),
    }, {transaction: t, logging: (msg) => request.log.info(msg)});
    await t.commit();
    response.send({success: true});
  } catch(err) {
    await t.rollback();
    response.send({success: false});
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
