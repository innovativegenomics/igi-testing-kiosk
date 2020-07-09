const express = require('express');
const router = express.Router();
const moment = require('moment');
const contentDisposition = require('content-disposition');
const short = require('short-uuid');
const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const { Sequelize, sequelize, Admin, Slot, User, Day, Settings } = require('../../models');
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
      response.redirect('/admin/search');
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

/**
 * request:
 * {
 *   term: string,
 *   perpage: number of results to return
 *   page: which page to return, starting at 0
 * }
 */
router.get('/search/slots', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 0) {
    const term = request.query.term || '';
    const perpage = parseInt(request.query.perpage);
    const page = parseInt(request.query.page);
    const { count, rows } = await User.findAndCountAll({
      limit: perpage,
      offset: perpage*page,
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
        [sequelize.literal('"slotTime"'), 'asc']
      ],
      include: [{
        model: Slot,
        order: [['time', 'desc']],
        limit: 1,
      }]
    });
    const res = [];
    rows.forEach(v => {
      res.push({
        time: v.Slots[0].time,
        location: v.Slots[0].location,
        uid: v.Slots[0].uid,
        completed: v.Slots[0].completed,
        name: `${v.firstname} ${v.lastname}`,
        calnetid: v.calnetid,
      });
    });
    response.send({success: true, results: res, count: count});
  } else {
    pino.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

/**
 * request:
 * {
 *   term: string,
 *   perpage: number of results to return
 *   page: which page to return, starting at 0
 * }
 */
router.get('/search/participants', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 20) {
    const term = request.query.term || '';
    const perpage = parseInt(request.query.perpage);
    const page = parseInt(request.query.page);
    const { count, rows } = await User.findAndCountAll({
      limit: perpage,
      offset: perpage*page,
      where: {
        [Op.or]: {
          firstname: {
            [Op.iLike]: `${term}%`,
          },
          middlename: {
            [Op.iLike]: `${term}%`,
          },
          lastname: {
            [Op.iLike]: `${term}%`,
          },
          email: {
            [Op.iLike]: `${term}%`,
          },
          phone: {
            [Op.iLike]: `${term}%`,
          },
          patientid: {
            [Op.iLike]: `${term}%`,
          },
        },
      }
    });
    response.send({success: true, results: rows, count: count});
  } else {
    pino.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

/**
 * request:
 * {
 *   starttime: moment.Moment,
 *   endtime: moment.Moment
 * }
 * response:
 * {
 *   success: true,
 *   scheduled: {
 *     moment.Moment: 
 *   }
 * }
 */
router.get('/stats/slots/scheduled', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 20) {
    const day = await Day.findOne({
      where: {
        date: {
          [Op.gte]: moment(request.query.day).startOf('day'),
          [Op.lt]: moment(request.query.day).startOf('day').add(1, 'day'),
        }
      }
    });
    const starttime = moment(day.date).set('hour', day.starthour).set('minute', day.startminute);
    const endtime = moment(day.date).set('hour', day.endhour).set('minute', day.endminute);
    try {
      const res = await Slot.findAll({
        attributes: ['time', [sequelize.cast(sequelize.fn('count', sequelize.col('time')), 'integer'), 'count']],
        group: ['time'],
        order: [['time', 'asc']],
        where: {
          time: {
            [Op.lt]: endtime.toDate(),
            [Op.gte]: starttime.toDate()
          },
          location: {
            [Op.not]: null
          },
          completed: null
        }
      });
      pino.debug(res);
      response.send({success: true, scheduled: res});
    } catch(err) {
      pino.error(`Can't get scheduled slots`);
      pino.error(err);
      response.send({success: false});
    }
  } else {
    pino.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

/**
 * request:
 * {
 *   starttime: moment.Moment,
 *   endtime: moment.Moment
 * }
 * response:
 * {
 *   success: true,
 *   scheduled: {
 *     moment.Moment: 
 *   }
 * }
 */
router.get('/stats/slots/completed', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 20) {
    const day = await Day.findOne({
      where: {
        date: {
          [Op.gte]: moment(request.query.day).startOf('day'),
          [Op.lt]: moment(request.query.day).startOf('day').add(1, 'day'),
        }
      }
    });
    const starttime = moment(day.date).set('hour', day.starthour).set('minute', day.startminute);
    const endtime = moment(day.date).set('hour', day.endhour).set('minute', day.endminute);
    try {
      const res = await Slot.findAll({
        attributes: ['time', [sequelize.cast(sequelize.fn('count', sequelize.col('time')), 'integer'), 'count']],
        group: ['time'],
        order: [['time', 'asc']],
        where: {
          time: {
            [Op.lt]: endtime.toDate(),
            [Op.gte]: starttime.toDate()
          },
          location: {
            [Op.not]: null
          },
          completed: {
            [Op.not]: null
          }
        }
      });
      pino.debug(res);
      response.send({success: true, completed: res});
    } catch(err) {
      pino.error(`Can't get completed slots`);
      pino.error(err);
      response.send({success: false});
    }
  } else {
    pino.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.get('/stats/general/scheduled', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 20) {
    try {
      const count = await User.count({
        where: sequelize.literal(`(select location from "Slots" as s where s.calnetid="User".calnetid order by time desc limit 1) is not null`)
      });
      response.send({
        success: true,
        scheduled: count
      });
    } catch(err) {
      pino.error(`error getting scheduled participants`);
      pino.error(err);
      response.send({success: false});
    }
  } else {
    pino.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.get('/stats/general/unscheduled', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 20) {
    try {
      const count = await User.count({
        where: sequelize.literal(`(select location from "Slots" as s where s.calnetid="User".calnetid order by time desc limit 1) is null`)
      });
      response.send({
        success: true,
        unscheduled: count
      });
    } catch(err) {
      pino.error(`error getting unscheduled participants`);
      pino.error(err);
      response.send({success: false});
    }
  } else {
    pino.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.get('/settings/day', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 20) {
    pino.debug(request.query.day);
    const d = moment(request.query.day).startOf('day').toDate();
    try {
      const day = await Day.findOne({
        where: {
          date: d
        }
      });
      response.send({success: true, day: day});
    } catch(err) {
      pino.error(`Can't get day`);
      pino.error(err);
      response.send({success: false});
    }
  } else {
    pino.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.post('/settings/day', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 30) {
    const starthour = parseInt(request.body.starthour);
    const startminute = parseInt(request.body.startminute);
    const endhour = parseInt(request.body.endhour);
    const endminute = parseInt(request.body.endminute);
    const date = moment(request.body.date).startOf('day');
    const window = parseInt(request.body.window);
    const buffer = parseInt(request.body.buffer);
    try {
      const day = await Day.create({
        starthour: starthour,
        startminute: startminute,
        endhour: endhour,
        endminute: endminute,
        date: date,
        window: window,
        buffer: buffer,
      });
      response.send({success: true});
    } catch(err) {
      pino.error(`Can't post day`);
      pino.error(err);
      response.send({success: false});
    }
  } else {
    pino.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.delete('/settings/day', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 30) {
    const id = request.query.id;
    try {
      const day = await Day.findOne({
        where: {
          id: id
        }
      });
      await day.destroy();
      response.send({success: true});
    } catch(err) {
      pino.error(`Can't delete day`);
      pino.error(err);
      response.send({success: false});
    }
  } else {
    pino.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.get('/settings/days', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 0) {
    try {
      const days = await Day.findAll({
        order: [['date', 'desc']]
      });
      response.send({
        success: true,
        days: days
      });
    } catch(err) {
      pino.error('error getting available days');
      pino.error(err);
      response.send({
        success: false
      });
    }
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

router.post('/uncomplete', cas.block, async (request, response) => {
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
      slot.completed = null;
      await slot.save();
      await t.commit();
      response.send({success: true});
    } catch(err) {
      pino.error(`Error uncompleting appointment for ${uid}`);
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

router.get('/settings', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  pino.info({
    route: '/api/admin/settings',
    calnetid: calnetid,
    level: level,
  });
  if(!!level && level >= 0) {
    const settings = await Settings.findOne({});
    response.send({
      settings: {
        locations: settings.locations,
        locationlinks: settings.locationlinks
      },
      success: true,
    });
  } else {
    pino.error({
      route: '/api/admin/settings',
      calnetid: calnetid,
      error: 'Not authed'
    });
    response.status(401).send();
  }
});


router.get('/study/participantinfo', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}})).level;
  if(!!level && level >= 40) {
    const users = await User.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT count(*)::integer
              FROM "Slots" AS slot
              WHERE
                slot.calnetid = "User".calnetid
              AND
                slot.completed is not null
              )`),
            'completedappts'
          ]
        ]
      }
    });
    let parsed = `calnetid,patientid,firstname,middlename,lastname,email,phone,dob,sex,pbuilding,datejoined,street,city,state,county,zip,completedappts,consent1,consent2,consent3,consent4`;
    pino.debug(users[0]);
    users.forEach(v => {
      parsed += `\n"${v.calnetid}","${v.patientid}","${v.firstname}","${v.middlename}","${v.lastname}","${v.email}","${v.phone}","${v.dob}","${v.sex}","${v.pbuilding}","${v.datejoined}","${v.street}","${v.city}","${v.state}","${v.county}","${v.zip}","${v.dataValues.completedappts}","${v.questions[0]}","${v.questions[1]}","${v.questions[2]}","${v.questions[3]}"`;
    });
    response.setHeader('Content-Disposition', contentDisposition(`participantinfo_${moment().format('M_DD_YYYY')}.csv`));
    response.setHeader('Content-Type', 'text/csv');
    response.send(parsed);
  } else {
    pino.error({
      route: '/api/admin/study/participantinfo',
      calnetid: calnetid,
      error: 'Not authed'
    });
    response.status(401).send();
  }
});


module.exports = router;
