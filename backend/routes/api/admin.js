const express = require('express');
const router = express.Router();
const moment = require('moment');
const contentDisposition = require('content-disposition');
const short = require('short-uuid');
// const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const { Sequelize, sequelize, Admin, Slot, User, Day, Settings } = require('../../models');
const Op = Sequelize.Op;

const cas = require('../../cas');
const { scheduleNewAdminEmail } = require('../../worker');

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
  const t = await sequelize.transaction({logging: (msg) => request.log.info(msg)});
  try {
    const user = await Admin.findOne({where: {calnetid: calnetid}, transaction: t, logging: (msg) => request.log.info(msg)});
    if(user) {
      request.session.usertype = 'admin';
      response.redirect('/admin/search');
    } else {
      if(!uid) {
        request.session.destroy((err) => {if(err) {request.log.error(`Couldn't destroy session for admin ${calnetid}`); request.log.error(err)}});
        response.status(401).send('Unauthorized');
      } else {
        const newuser = await Admin.findOne({where: {uid: uid}, transaction: t, logging: (msg) => request.log.info(msg)});
        if(!newuser) {
          request.session.destroy((err) => {if(err) {request.log.error(`Couldn't destroy session for admin ${calnetid}`); request.log.error(err)}});
          response.status(401).send('Unauthorized');
        } else {
          if(!newuser.calnetid) {
            newuser.calnetid = calnetid;
            await newuser.save();
            request.session.usertype='admin';
            response.redirect('/admin/dashboard');
          } else {
            request.session.destroy((err) => {if(err) {request.log.error(`Couldn't destroy session for admin ${calnetid}`); request.log.error(err)}});
            response.status(401).send('Unauthorized');
          }
        }
      }
    }
    await t.commit();
  } catch(err) {
    request.log.error(`Could not login admin user ${calnetid} ${uid}`);
    request.log.error(err);
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
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 0) {
    try {
      const slot = await Slot.findOne({
        where: {
          uid: request.query.uid || ''
        },
        include: User,
        logging: (msg) => request.log.info(msg)
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
    request.log.info('unauthed');
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
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
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
      }],
      logging: (msg) => request.log.info(msg)
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
    request.log.info('unauthed');
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
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
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
      },
      logging: (msg) => request.log.info(msg)
    });
    response.send({success: true, results: rows, count: count});
  } else {
    request.log.info('unauthed');
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
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 20) {
    const day = await Day.findOne({
      where: {
        date: {
          [Op.gte]: moment(request.query.day).startOf('day'),
          [Op.lt]: moment(request.query.day).startOf('day').add(1, 'day'),
        }
      },
      logging: (msg) => request.log.info(msg)
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
        },
        logging: (msg) => request.log.info(msg)
      });
      request.log.debug(res);
      response.send({success: true, scheduled: res});
    } catch(err) {
      request.log.error(`Can't get scheduled slots`);
      request.log.error(err);
      response.send({success: false});
    }
  } else {
    request.log.info('unauthed');
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
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 20) {
    const day = await Day.findOne({
      where: {
        date: {
          [Op.gte]: moment(request.query.day).startOf('day'),
          [Op.lt]: moment(request.query.day).startOf('day').add(1, 'day'),
        }
      },
      logging: (msg) => request.log.info(msg)
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
        },
        logging: (msg) => request.log.info(msg)
      });
      request.log.debug(res);
      response.send({success: true, completed: res});
    } catch(err) {
      request.log.error(`Can't get completed slots`);
      request.log.error(err);
      response.send({success: false});
    }
  } else {
    request.log.info('unauthed');
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
      request.log.error(`error getting scheduled participants`);
      request.log.error(err);
      response.send({success: false});
    }
  } else {
    request.log.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.get('/stats/general/unscheduled', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 20) {
    try {
      const count = await User.count({
        where: sequelize.literal(`(select location from "Slots" as s where s.calnetid="User".calnetid order by time desc limit 1) is null`),
        logging: (msg) => request.log.info(msg)
      });
      response.send({
        success: true,
        unscheduled: count
      });
    } catch(err) {
      request.log.error(`error getting unscheduled participants`);
      request.log.error(err);
      response.send({success: false});
    }
  } else {
    request.log.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.get('/stats/general/reconsented', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 20) {
    try {
      const reCount = await User.count({
        where: {
          reconsented: true
        },
        logging: (msg) => request.log.info(msg)
      });
      const unreCount = await User.count({
        where: {
          reconsented: false
        },
        logging: (msg) => request.log.info(msg)
      });
      response.send({
        success: true,
        reconsented: reCount,
        unreconsented: unreCount
      });
    } catch(err) {
      request.log.error(`error getting reconsented participants`);
      request.log.error(err);
      response.send({success: false});
    }
  } else {
    request.log.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.get('/settings/day', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 20) {
    request.log.debug(request.query.day);
    const d = moment(request.query.day).startOf('day').toDate();
    try {
      const day = await Day.findOne({
        where: {
          date: d
        },
        logging: (msg) => request.log.info(msg)
      });
      response.send({success: true, day: day});
    } catch(err) {
      request.log.error(`Can't get day`);
      request.log.error(err);
      response.send({success: false});
    }
  } else {
    request.log.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.post('/settings/day', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
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
      }, {logging: (msg) => request.log.info(msg)});
      response.send({success: true});
    } catch(err) {
      request.log.error(`Can't post day`);
      request.log.error(err);
      response.send({success: false});
    }
  } else {
    request.log.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.delete('/settings/day', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 30) {
    const id = request.query.id;
    try {
      const day = await Day.findOne({
        where: {
          id: id
        },
        logging: (msg) => request.log.info(msg)
      });
      await day.destroy();
      response.send({success: true});
    } catch(err) {
      request.log.error(`Can't delete day`);
      request.log.error(err);
      response.send({success: false});
    }
  } else {
    request.log.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.get('/settings/days', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 0) {
    try {
      const days = await Day.findAll({
        order: [['date', 'desc']],
        logging: (msg) => request.log.info(msg)
      });
      response.send({
        success: true,
        days: days
      });
    } catch(err) {
      request.log.error('error getting available days');
      request.log.error(err);
      response.send({
        success: false
      });
    }
  } else {
    request.log.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.post('/complete', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 10) {
    const t = await sequelize.transaction({logging: (msg) => request.log.info(msg)});
    try {
      const slot = await Slot.findOne({
        where: {
          uid: request.body.uid,
        },
        transaction: t,
        logging: (msg) => request.log.info(msg)
      });
      slot.completed = moment().toDate();
      await slot.save();
      await t.commit();
      response.send({success: true});
    } catch(err) {
      request.log.error(`Error completing appointment for ${request.body.uid}`);
      request.log.error(err);
      await t.rollback();
      response.send({success: false});
    }
  } else {
    request.log.error(`Not authed`);
    response.status(401).send();
  }
});

router.post('/uncomplete', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 10) {
    const t = await sequelize.transaction({logging: (msg) => request.log.info(msg)});
    try {
      const slot = await Slot.findOne({
        where: {
          uid: request.body.uid,
        },
        transaction: t,
        logging: (msg) => request.log.info(msg)
      });
      slot.completed = null;
      await slot.save();
      await t.commit();
      response.send({success: true});
    } catch(err) {
      request.log.error(`Error uncompleting appointment for ${request.body.uid}`);
      request.log.error(err);
      await t.rollback();
      response.send({success: false});
    }
  } else {
    request.log.error(`Not authed`);
    response.status(401).send();
  }
});

router.get('/level', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  response.send({ success: true, level: level });
});

router.get('/admins', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 30) {
    try {
      const admins = (await Admin.findAll({where:{calnetid: {[Op.not]: null}}, logging: (msg) => request.log.info(msg)})).map(a => ({
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
    request.log.error(`Not authed`);
    response.status(401).send();
  }
});

router.delete('/admins', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 30) {
    if(!request.query.uid) {
      response.send({success: false});
    } else {
      try {
        const admin = await Admin.findOne({where: {uid: request.query.uid}, logging: (msg) => request.log.info(msg)});
        await admin.destroy();
        response.send({
          success: true
        });
      } catch(err) {
        response.send({success: false});
      }
    }
  } else {
    request.log.error(`Not authed`);
    response.status(401).send();
  }
});

router.post('/admins', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
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
        }, {logging: (msg) => request.log.info(msg)});
        await scheduleNewAdminEmail({calnetid: request.body.email, uid: uid});
        response.send({
          success: true
        });
      } catch(err) {
        response.send({success: false});
      }
    }
  } else {
    request.log.error(`Not authed`);
    response.status(401).send();
  }
});

router.get('/admins/pending', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 30) {
    try {
      const admins = (await Admin.findAll({where:{calnetid: null}, logging: (msg) => request.log.info(msg)})).map(a => ({
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
    request.log.error(`Not authed`);
    response.status(401).send();
  }
});

router.get('/settings', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 0) {
    const settings = await Settings.findOne({logging: (msg) => request.log.info(msg)});
    response.send({
      settings: {
        locations: settings.locations,
        locationlinks: settings.locationlinks
      },
      success: true,
    });
  } else {
    request.log.error('Not authed');
    response.status(401).send();
  }
});

router.patch('/participant', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 30) {
    const t = await sequelize.transaction({logging: (msg) => request.log.info(msg)});
    try {
      const rec = await User.findOne({
        where: {
          calnetid: request.body.calnetid
        },
        transaction: t,
        logging: (msg) => request.log.info(msg)
      });
      await rec.update(request.body.params);
      await t.commit();
      response.send({success: true});
    } catch(err) {
      await t.rollback();
      request.log.error(`Couldn't update user ${request.body.calnetid}`);
      request.log.error(err);
      response.send({success: false});
    }
  } else {
    request.log.error('Not authed');
    response.status(401).send();
  }
});


router.get('/study/participantinfo', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
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
      },
      logging: (msg) => request.log.info(msg)
    });
    let parsed = `calnetid,patientid,firstname,middlename,lastname,email,phone,dob,sex,pbuilding,datejoined,street,city,state,county,zip,completedappts,reconsented,consent1,consent2,consent3,consent4,consent5`;
    request.log.debug(users[0]);
    users.forEach(v => {
      parsed += `\n"${v.calnetid}","${v.patientid}","${v.firstname}","${v.middlename}","${v.lastname}","${v.email}","${v.phone}","${v.dob}","${v.sex}","${v.pbuilding}","${v.datejoined}","${v.street}","${v.city}","${v.state}","${v.county}","${v.zip}","${v.dataValues.completedappts}","${v.dataValues.reconsented}","${v.questions[0]}","${v.questions[1]}","${v.questions[2]}","${v.questions[3]}","${v.questions[4]}"`;
    });
    response.setHeader('Content-Disposition', contentDisposition(`participantinfo_${moment().format('M_DD_YYYY')}.csv`));
    response.setHeader('Content-Type', 'text/csv');
    response.send(parsed);
  } else {
    request.log.error('Not authed');
    response.status(401).send();
  }
});


module.exports = router;
