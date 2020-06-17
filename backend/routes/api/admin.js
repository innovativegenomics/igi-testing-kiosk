const express = require('express');
const router = express.Router();
const moment = require('moment');
const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const { Sequelize, sequelize, Admin, Slot, User } = require('../../models');
const Op = Sequelize.Op;

const cas = require('../../cas');

/**
 * User admin levels:
 * 0 - basic, can view user appointments from QR Code scan or search
 * 10 - station 2, can mark user as completed
 * 20 - can view statistics
 * 30 - can add new admin users
 */

router.get('/login', cas.bounce, async (request, response) => {
  const calnetid = request.session.cas_user;
  const uid = request.query.uid;
  const t = await sequelize.transaction();
  try {
    const user = await Admin.findOne({where: {calnetid: calnetid}, transaction: t});
    if(user) {
      await t.commit();
      request.session.usertype = 'admin';
      request.session.adminlevel = user.level;
      response.redirect('/admin/dashboard');
    } else {
      if(!uid) {
        await t.commit();
        request.session.destroy((err) => {if(err) {pino.error(`Couldn't destroy session for admin ${calnetid}`); pino.error(err)}});
        response.status(401).send('Unauthorized');
      } else {
        const newuser = await Admin.findOne({where: {uid: uid}, transaction: t});
        if(!newuser) {
          await t.commit();
          request.session.destroy((err) => {if(err) {pino.error(`Couldn't destroy session for admin ${calnetid}`); pino.error(err)}});
          response.status(401).send('Unauthorized');
        } else {
          if(!newuser.calnetid) {
            newuser.calnetid = calnetid;
            await newuser.save();
            await t.commit();
            request.session.usertype='admin';
            request.session.adminlevel=newuser.level;
            response.redirect('/admin/dashboard');
          } else {
            await t.commit();
            request.session.destroy((err) => {if(err) {pino.error(`Couldn't destroy session for admin ${calnetid}`); pino.error(err)}});
            response.status(401).send('Unauthorized');
          }
        }
      }
    }
  } catch(err) {
    pino.error(`Could not login admin user ${calnetid} ${uid}`);
    pino.error(err);
    await t.rollback();
    response.status(500).send();
  }
});

router.get('/slot', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  pino.info(calnetid);
  const level = request.session.adminlevel;
  if(!!level && level >= 0) {
    try {
      const slot = await Slot.findOne({
        where: {
          uid: request.body.uid || ''
        },
        include: User
      });
      if(!slot) {
        response.send({success: false});
      } else {
        response.send({
          success: true,
          slot: {
            time: slot.time,
            location: slot.location,
            uid: slot.uid,
            name: `${slot.User.firstname} ${slot.User.lastname}`,
          },
        });
      }
    } catch(err) {
      response.status(500).send('Internal server error');
    }
  } else {
    pino.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.get('/search', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = request.session.adminlevel;
  if(!!level && level >= 0) {
    const term = request.body.term || '';
    const users = await User.findAll({
      where: {
        [Op.or]: {
          firstname: {
            [Op.iLike]: `${term}%`,
          },
          lastname: {
            [Op.iLike]: `${term}%`,
          },
        },
      },
      include: [{
        model: Slot,
        order: [['time', 'desc']],
        limit: 1,
      }]
    });
    const res = [];
    users.forEach(v => {
      res.push({
        time: v.Slots[0].time,
        location: v.Slots[0].location,
        uid: v.Slots[0].uid,
        name: `${v.firstname} ${v.lastname}`,
      });
    });
    response.send({success: true, results: res});
  } else {
    pino.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.post('/complete', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = request.session.adminlevel;
  if(!!level && level >= 10) {
    const t = await sequelize.transaction();
    try {
      const slot = await Slot.findOne({
        where: {
          uid: request.body.uid,
        },
        transaction: t,
      });
      slot.completed = moment().toDate();
      await slot.save();
      await t.commit();
      response.send({success: true});
    } catch(err) {
      pino.error(`Error completing appointment for ${uid}`);
      pino.error(err);
      await t.rollback();
      response.send({success: false});
    }
  } else {
    pino.error(`Not authed`);
    response.status(401).send();
  }
});

module.exports = router;
