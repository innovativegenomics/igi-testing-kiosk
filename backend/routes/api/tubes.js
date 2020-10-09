const express = require('express');
const router = express.Router();
// const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const moment = require('moment');

const { sequelize, Sequelize, User, Tube, Dropoff, DropoffDay } = require('../../models');
const Op = Sequelize.Op;
const cas = require('../../cas');

router.get('/tube', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  try {
    const tube = await Tube.findOne({
      where: {
        calnetid: calnetid,
        current: true
      },
      include: {
        model: DropoffDay,
        required: false
      },
      logging: (msg) => request.log.info(msg)
    });
    response.json({ success: true, tube: tube});
  } catch(err) {
    request.log.error('error getting tube');
    request.log.error(err.stack);
    response.json({ success: false });
  }
});

router.get('/available_dropoffs', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  try {
    const available = await DropoffDay.findAll({
      where: {
        available: {
          [Op.gt]: 0
        }
      },
      order: [
        ['date', 'asc'],
        ['location', 'asc'],
      ],
      include: Dropoff,
      logging: (msg) => request.log.info(msg)
    });
    let days = [];
    available.forEach(e => {
      if(e.date !== days.slice(-1)[0]){
        days.push(e.date)
      }
    });
    response.send({ success: true, available, days });
  } catch(err) {
    request.log.error('error getting available dropoff times');
    request.log.error(err.stack);
    response.json({ success: false });
  }
});

router.post('/request', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const id = request.body.id;
  const t = await sequelize.transaction({
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
    logging: (msg) => request.log.info(msg)
  });
  try {
    const selected = await DropoffDay.findOne({
      where: {
        id
      },
      include: Dropoff,
      logging: (msg) => request.log.info(msg),
      transaction: t
    });
    if(selected.available < 1) {
      throw new Error('dropoff is full');
    }
    const tube = await Tube.findOne({
      where: {
        calnetid: calnetid,
        current: true
      },
      include: {
        model: DropoffDay,
        required: false
      },
      logging: (msg) => request.log.info(msg),
      transaction: t
    });
    if(tube.DropoffDay) {
      tube.DropoffDay.available += 1;
      await tube.DropoffDay.save();
    }
    selected.available -= 1;
    await selected.save();
    tube.DropoffDay = selected;
    tube.scheduledDropoff = selected.date;
    await tube.save();
    response.send({success: true});
    await t.commit();
  } catch(err) {
    await t.rollback();
    request.log.error('error getting available dropoff times');
    request.log.error(err.stack);
    response.json({ success: false });
  }
});

router.delete('/cancel', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  try {
    const tube = await Tube.findOne({
      where: {
        calnetid,
        current: true
      },
      logging: (msg) => request.log.info(msg),
    });
    if(tube) {
      tube.selectedDropoff = null;
      tube.DropoffDay.available += 1;
      await tube.DropoffDay.save();
      tube.DropoffDay = null;
      await tube.save();
    }
    response.json({success: true});
  } catch(err) {
    request.log.error('error cancelling dropoff');
    request.log.error(err.stack);
    response.json({ success: false });
  }
});

module.exports = router;
