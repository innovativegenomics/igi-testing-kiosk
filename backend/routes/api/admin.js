const express = require('express');
const router = express.Router();
const moment = require('moment');
const short = require('short-uuid');
const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const { Sequelize, sequelize, Admin, Slot, User } = require('../../models');
const Op = Sequelize.Op;

const cas = require('../../cas');
const { scheduleNewAdminEmail } = require('../../scheduler');

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
      request.session.usertype = 'admin';
      response.redirect('/admin/dashboard');
    } else {
      if(!uid) {
        request.session.destroy((err) => {if(err) {pino.error(`Couldn't destroy session for admin ${calnetid}`); pino.error(err)}});
        response.status(401).send('Unauthorized');
      } else {
        const newuser = await Admin.findOne({where: {uid: uid}, transaction: t});
        if(!newuser) {
          request.session.destroy((err) => {if(err) {pino.error(`Couldn't destroy session for admin ${calnetid}`); pino.error(err)}});
          response.status(401).send('Unauthorized');
        } else {
          if(!newuser.calnetid) {
            newuser.calnetid = calnetid;
            await newuser.save();
            request.session.usertype='admin';
            response.redirect('/admin/dashboard');
          } else {
            request.session.destroy((err) => {if(err) {pino.error(`Couldn't destroy session for admin ${calnetid}`); pino.error(err)}});
            response.status(401).send('Unauthorized');
          }
        }
      }
    }
    await t.commit();
  } catch(err) {
    pino.error(`Could not login admin user ${calnetid} ${uid}`);
    pino.error(err);
    await t.rollback();
    response.status(500).send();
  }
});

/**
 * Logs out admins
 */
router.get('/logout', cas.logout);

router.get('/slot', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 0) {
    try {
      const slot = await Slot.findOne({
        where: {
          uid: request.query.uid || ''
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
            completed: slot.completed,
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
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 0) {
    const term = request.query.term || '';
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
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT time
              FROM "Slots" AS slot
              WHERE
                slot.calnetid = "User".calnetid
              ORDER BY time DESC
              LIMIT 1
              )`),
            'slotTime'
          ]
        ]
      },
      order: [
        [sequelize.literal('"slotTime"'), 'desc']
      ],
      include: [{
        model: Slot,
        separate: true,
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
        completed: v.Slots[0].completed,
        name: `${v.firstname} ${v.lastname}`,
        calnetid: v.calnetid,
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
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
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

router.get('/level', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  response.send({ success: true, level: level });
});

router.get('/admins', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 30) {
    try {
      const admins = (await Admin.findAll({where:{calnetid: {[Op.not]: null}}})).map(a => ({
        name: a.name,
        level: a.level,
        email: a.email,
        uid: a.uid,
        calnetid: a.calnetid,
      }));
      response.send({
        success: true,
        admins: admins
      });
    } catch(err) {
      response.send({success: false});
    }
  } else {
    pino.error(`Not authed`);
    response.status(401).send();
  }
});

router.delete('/admins', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 30) {
    if(!request.query.uid) {
      response.send({success: false});
    } else {
      try {
        const admin = await Admin.findOne({where: {uid: request.query.uid}});
        await admin.destroy();
        response.send({
          success: true
        });
      } catch(err) {
        response.send({success: false});
      }
    }
  } else {
    pino.error(`Not authed`);
    response.status(401).send();
  }
});

router.post('/admins', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 30) {
    if(!request.body.name || !request.body.email || !(request.body.level >= 0)) {
      response.send({success: false});
    } else {
      try {
        const uid = short().new();
        const admin = await Admin.create({
          name: request.body.name,
          email: request.body.email,
          level: request.body.level,
          uid: uid,
        });
        await scheduleNewAdminEmail(request.body.email, uid);
        response.send({
          success: true
        });
      } catch(err) {
        response.send({success: false});
      }
    }
  } else {
    pino.error(`Not authed`);
    response.status(401).send();
  }
});

router.get('/admins/pending', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 30) {
    try {
      const admins = (await Admin.findAll({where:{calnetid: null}})).map(a => ({
        name: a.name,
        level: a.level,
        email: a.email,
        uid: a.uid
      }));
      response.send({
        success: true,
        admins: admins
      });
    } catch(err) {
      response.send({success: false});
    }
  } else {
    pino.error(`Not authed`);
    response.status(401).send();
  }
});

module.exports = router;
