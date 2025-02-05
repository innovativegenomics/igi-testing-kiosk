const express = require('express');
const router = express.Router();
const moment = require('moment');
const contentDisposition = require('content-disposition');
const short = require('short-uuid');
// const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const { Sequelize, sequelize, Admin, Slot, User, Day, Settings, ExternalUser, OpenTime, Location } = require('../../models');
const Op = Sequelize.Op;

const cas = require('../../cas');
const { scheduleNewAdminEmail, scheduleExternalUserApproveEmail, scheduleExternalUserRejectEmail, scheduleAirQualityCancellation, scheduleCustomCancellation, scheduleLabCapacityCancellation } = require('../../worker');
const { request } = require('express');

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
      request.log.debug('here');
      const slot = await Slot.findOne({
        where: {
          uid: request.query.uid
        },
        include: [
          {
            model: User,
            attributes: ['firstname', 'lastname', 'patientid']
          },
          {
            model: OpenTime,
            include: Location
          }
        ],
        logging: (msg) => request.log.info(msg)
      });
      // const user = await User.findOne({
      //   where: {
      //     calnetid: slot.dataValues.calnetid
      //   },
      //   logging: (msg) => request.log.info(msg)
      // });
      const count = await Slot.count({
        where: {
          calnetid: slot.dataValues.calnetid,
          completed: {
            [Op.not]: null
          }
        },
        logging: (msg) => request.log.info(msg)
      })
      if(!slot) {
        response.send({success: false});
      } else {
        response.send({
          success: true,
          slot: {
            ...slot.dataValues,
            name: `${slot.User.firstname} ${slot.User.lastname}`,
            patientid: slot.User.patientid,
            apptCount: count
          },
        });
      }
    } catch(err) {
      request.log.error(err.stack);
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
    try {
      const term = request.query.term || '';
      const perpage = parseInt(request.query.perpage);
      const page = parseInt(request.query.page);
      const { count, rows } = await User.findAndCountAll({
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
        // attributes: {
        //   include: [
        //     [
        //       sequelize.literal(`(
        //         SELECT time
        //         FROM "Slots" AS slot
        //         WHERE
        //           slot.calnetid = "User".calnetid
        //         AND
        //           slot.current = true
        //         )`),
        //       'slotTime'
        //     ]
        //   ]
        // },
        // order: [
        //   [sequelize.literal('"slotTime"'), 'asc']
        // ],
        order: [
          [Slot, 'time', 'asc'],
          ['availableStart', 'asc']
        ],
        include: [{
          model: Slot,
          where: {
            current: true
          },
          required: false,
          duplicating: false,
          include: {
            model: OpenTime,
            include: Location
          }
        }],
        limit: perpage,
        offset: perpage*page,
        logging: (msg) => request.log.info(msg)
      });
      const res = [];
      rows.forEach(v => {
        res.push({
          time: v.Slots[0] ? v.Slots[0].time : v.availableStart,
          location: v.Slots[0] ? v.Slots[0].OpenTime.Location.name : null,
          uid: v.Slots[0] ? v.Slots[0].uid : null,
          completed: v.Slots[0] ? v.Slots[0].completed : null,
          name: `${v.firstname} ${v.lastname}`,
          calnetid: v.calnetid,
        });
      });
      response.send({success: true, results: res, count: count});
    } catch(err) {
      request.log.error(`error searching slots`);
      request.log.error(err.stack);
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
      order: [['datejoined', 'desc']],
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
router.get('/stats/slots', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 20) {
    try {
      const scheduled = await OpenTime.findAll({
        where: {
          starttime: {
            [Op.gte]: moment(request.query.starttime).toDate(),
            [Op.lt]: moment(request.query.endtime).toDate()
          },
          location: request.query.location
        },
        attributes: {
          include: [[Sequelize.cast(Sequelize.fn('COUNT', Sequelize.col('Slots.id')), 'INTEGER'), 'completedCount']]
        },
        order: [['starttime', 'asc']],
        include: [
          {
            model: Slot,
            attributes: [],
            where: {
              completed: {
                [Op.not]: null
              }
            },
            required: false,
            duplicating: false
          }
        ],
        group: ['OpenTime.id'],
        logging: (msg) => request.log.info(msg)
      });
      response.send({success: true, slots: scheduled});
    } catch(err) {
      request.log.error(`Error getting slot statistics`);
      request.log.error(err.stack);
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
        include: {
          model: Slot,
          where: {
            current: true
          },
          required: true
        },
        logging: (msg) => request.log.info(msg)
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
      const totalCount = await User.count({});
      const count = await User.count({
        include: {
          model: Slot,
          where: {
            current: true
          },
          required: true
        },
        logging: (msg) => request.log.info(msg)
      });
      response.send({
        success: true,
        unscheduled: totalCount - count
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

router.get('/stats/newusers', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 20) {
    try {
      const fromDate = request.query.fromDate?moment(request.query.fromDate).startOf('day'):undefined;
      const toDate = request.query.toDate?moment(request.query.toDate).startOf('day').add(1, 'day'):undefined;
      request.log.debug(fromDate.format());
      request.log.debug(toDate.format());
      const newusers = await User.findAll({
        where: {
          createdAt: {
            [Op.gte]: fromDate.toDate(),
            [Op.lte]: toDate.toDate()
          }
        },
        attributes: [
          [sequelize.cast(sequelize.fn('count', sequelize.col('*')), 'INTEGER'), 'count'],
          [sequelize.cast(sequelize.col('createdAt'), 'DATE'), 'date']
        ],
        group: [sequelize.cast(sequelize.col('createdAt'), 'DATE')],
        order: [[sequelize.cast(sequelize.col('createdAt'), 'DATE'), 'asc']],
        logging: (msg) => request.log.info(msg)
      });
      response.send({
        success: true,
        newusers: newusers
      });
    } catch(err) {
      request.log.error(`error getting newuser stats`);
      request.log.error(err);
      response.send({success: false});
    }
  } else {
    request.log.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.get('/stats/completion', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 20) {
    try {
      const completion = await Slot.findAll({
        attributes: [
          [sequelize.cast(sequelize.fn('count', sequelize.col('*')), 'INTEGER'), 'count'],
          [sequelize.literal(`"Slot".completed is not null`), 'isCompleted'],
          [sequelize.cast(sequelize.fn('date_trunc', 'week', sequelize.cast(sequelize.col('time'), 'DATE')), 'DATE'), 'week']
        ],
        group: ['week', 'isCompleted'],
        order: [
          [sequelize.literal(`"week"`), 'asc'],
          [sequelize.literal(`"isCompleted"`), 'asc']
        ],
        logging: (msg) => request.log.info(msg)
      });
      const available = await OpenTime.findAll({
        attributes: [
          [sequelize.cast(sequelize.fn('sum', sequelize.col('buffer')), 'INTEGER'), 'sum'],
          [sequelize.cast(sequelize.fn('date_trunc', 'week', sequelize.col('date')), 'DATE'), 'week']
        ],
        group: ['week'],
        order: [
          [sequelize.literal(`"week"`), 'asc']
        ],
        logging: (msg) => request.log.info(msg)
      });
      const res = [];
      available.forEach(v => {
        const completed = completion.find(c => c.dataValues.week === v.dataValues.week && c.dataValues.isCompleted);
        const notCompleted = completion.find(c => c.dataValues.week === v.dataValues.week && !c.dataValues.isCompleted);
        res.push({
          week: v.dataValues.week,
          total: v.dataValues.sum,
          completed: completed ? completed.dataValues.count : 0,
          notCompleted: notCompleted ? notCompleted.dataValues.count : 0,
        });
      });
      response.send({
        success: true,
        res: res
      });
    } catch(err) {
      request.log.error(`error getting completion stats`);
      request.log.error(err);
      response.send({success: false});
    }
  } else {
    request.log.info('unauthed');
    response.status(401).send('Unauthorized');
  }
});

router.get('/stats/affiliation', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 20) {
    try {
      const res = await User.findAll({
        attributes: [
          [Sequelize.cast(Sequelize.fn('count', Sequelize.col('*')), 'INTEGER'), 'count'],
          'affiliation'
        ],
        group: ['affiliation'],
        logging: (msg) => request.log.info(msg)
      });
      response.send({
        success: true,
        res: res
      });
    } catch(err) {
      request.log.error(`error getting affiliation stats`);
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
  if(!!level && level >= 10) {
    const res = await OpenTime.findAll({
      attributes: [
        'date',
        [sequelize.cast(sequelize.fn('count', sequelize.col('*')), 'INTEGER'), 'count'],
        [sequelize.fn('min', sequelize.col('starttime')), 'starttime'],
        [sequelize.fn('max', sequelize.col('endtime')), 'endtime'],
        [sequelize.fn('max', sequelize.col('window')), 'window'],
        [sequelize.fn('max', sequelize.col('buffer')), 'buffer'],
      ],
      include: Location,
      order: [['date', 'desc']],
      group: ['date', 'Location.id'],
      logging: (msg) => request.log.info(msg)
    });
    response.send({
      success: true,
      days: res
    });
  } else {
    request.log.error(`Not authed`);
    response.status(401).send();
  }
});

router.get('/settings/locations', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 10) {
    const res = await Location.findAll();
    response.send({
      success: true,
      locations: res
    });
  } else {
    request.log.error(`Not authed`);
    response.status(401).send();
  }
});

router.post('/settings/day', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 30) {
    try {
      const start = moment(request.body.date).set('hour', request.body.starthour).set('minute', request.body.startminute);
      const end = moment(request.body.date).set('hour', request.body.endhour).set('minute', request.body.endminute);
      const location = await Location.findOne({
        where: {
          id: request.body.location
        },
        logging: (msg) => request.log.info(msg)
      });
      const buffer = request.body.buffer;
      const window = request.body.window;

      for(let i = start.clone();i.isBefore(end);i = i.add(window, 'minute')) {
        await location.createOpenTime({
          starttime: i.clone().toDate(),
          endtime: i.clone().add(window, 'minute').toDate(),
          date: i.clone().startOf('day').toDate(),
          buffer: buffer,
          window: window,
          available: buffer
        }, {
          logging: (msg) => request.log.info(msg)
        });
      }

      response.send({success: true});
    } catch(err) {
      request.log.error(`error creating open slots`);
      request.log.error(err.stack);
    }
  } else {
    request.log.error(`Not authed`);
    response.status(401).send();
  }
});

router.delete('/settings/day', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 30) {
    try {
      const subject = request.query.subject;
      const message = request.query.message;
      const starttime = request.query.starttime ? moment(request.query.starttime) : moment(request.query.date).startOf('date');
      const endtime = request.query.endtime ? moment(request.query.endtime) : moment(request.query.date).endOf('date');
      const location = request.query.location;

      const toBeDeleted = await OpenTime.findAll({
        where: {
          starttime: {
            [Op.gte]: moment().toDate(),
            [Op.gte]: starttime.toDate(),
            [Op.lt]: endtime.toDate()
          },
          location: location
        },
        include: {
          model: Slot,
          where: {
            current: true,
            completed: null
          },
          required: false,
          include: User
        },
        logging: (msg) => request.log.info(msg)
      });

      const contacts = [];
      const deletePromises = [];
      toBeDeleted.forEach(v => {
        v.Slots.forEach(s => {
          contacts.push([s.User.firstname, s.User.email, s.User.phone, s.User.calnetid]);
        });
        deletePromises.push((async () => {
          await User.update({
            availableEnd: null
          }, {
            where: {
              calnetid: v.Slots.map(s => s.calnetid)
            },
            logging: (msg) => request.log.info(msg)
          });
          await Slot.destroy({
            where: {
              id: v.Slots.map(s => s.id)
            },
            logging: (msg) => request.log.info(msg)
          })
        })());
      });
      deletePromises.push((async () => {
        await OpenTime.destroy({
          where: {
            id: toBeDeleted.map(v => v.id)
          },
          logging: (msg) => request.log.info(msg)
        })
      })());
      await Promise.all(deletePromises);

      for(let i of contacts) {
        if(request.query.reason === 'air_quality') {
          await scheduleAirQualityCancellation({name: i[0], email: i[1], phone: i[2], calnetid: i[3]});
        } else if(request.query.reason === 'lab_capacity') {
          await scheduleLabCapacityCancellation({name: i[0], email: i[1], phone: i[2], calnetid: i[3]});
        } else if(request.query.reason === 'custom') {
          await scheduleCustomCancellation({name: i[0], email: i[1], phone: i[2], calnetid: i[3], subject, message});
        }
      }

      response.send({success: true});
    } catch(err) {
      request.log.error(`error deleting open slots`);
      request.log.error(err.stack);
    }
  } else {
    request.log.error(`Not authed`);
    response.status(401).send();
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
        await scheduleNewAdminEmail({email: request.body.email, uid: uid});
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

router.delete('/participant', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 30) {
    const t = await sequelize.transaction({logging: (msg) => request.log.info(msg)});
    try {
      const rec = await User.findOne({
        where: {
          calnetid: request.query.calnetid
        },
        include: [
          {
            model: Slot,
            required: false
          },
          {
            model: ExternalUser,
            required: false
          }
        ],
        transaction: t,
        logging: (msg) => request.log.info(msg)
      });
      const promises = [];
      rec.Slots.forEach(slot => {
        promises.push((async () => await slot.destroy())());
      });
      await Promise.all(promises);
      if(rec.ExternalUser) {
        await rec.ExternalUser.destroy();
      }
      await rec.destroy();
      await t.commit();
      response.send({success: true});
    } catch(err) {
      await t.rollback();
      request.log.error(`Couldn't delete user ${request.query.calnetid}`);
      request.log.error(err.stack);
      response.send({success: false});
    }
  } else {
    request.log.error('Not authed');
    response.status(401).send();
  }
});

router.get('/external/users', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 30) {
    try {
      const search = request.query.search;
      const extUsers = await ExternalUser.findAll({
        where: {
          [Op.or]: {
            name: {
              [Op.iLike]: `${search}%`,
            },
            email: {
              [Op.iLike]: `${search}%`,
            }
          }
        },
        include: {
          model: User,
          required: false
        },
        order: [['createdAt', 'desc']],
        logging: (msg) => request.log.info(msg)
      });
      response.send({
        success: true,
        extUsers: extUsers
      });
    } catch(err) {
      request.log.error('error getting external users');
      request.log.error(err.stack);
      response.send({ success: false });
    }
  } else {
    request.log.error('Not authed');
    response.status(401).send();
  }
});

router.post('/external/approve', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 30) {
    try {
      const uid = request.body.uid;
      const extUser = await ExternalUser.findOne({
        where: {
          uid: uid
        },
        logging: (msg) => request.log.info(msg)
      });
      extUser.approved = true;
      await extUser.save();
      // send approval email
      try {
        await scheduleExternalUserApproveEmail({
          email: extUser.email,
          name: extUser.name,
          uid: extUser.uid
        });
      } catch(err) {
        request.log.error(`Error sending external user approval email`);
        request.log.error(err.stack);
      }
      response.send({
        success: true
      });
    } catch(err) {
      request.log.error(`error approving external user ${request.body.uid}`);
      request.log.error(err.stack);
      response.send({ success: false });
    }
  } else {
    request.log.error('Not authed');
    response.status(401).send();
  }
});

router.delete('/external/user', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 30) {
    try {
      const uid = request.query.uid;
      const extUser = await ExternalUser.findOne({
        where: {
          uid: uid
        },
        logging: (msg) => request.log.info(msg)
      });
      // send rejection email
      try {
        await scheduleExternalUserRejectEmail({
          email: extUser.email,
          name: extUser.name
        });
      } catch(err) {
        request.log.error(`Error sending external user reject email`);
        request.log.error(err.stack);
      }
      await extUser.destroy();
      response.send({
        success: true
      });
    } catch(err) {
      request.log.error(`error approving external user ${request.body.uid}`);
      request.log.error(err.stack);
      response.send({ success: false });
    }
  } else {
    request.log.error('Not authed');
    response.status(401).send();
  }
});

router.patch('/settings/day/buffer', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 30) {
    try {
      const date = request.body.date;
      const loc = request.body.loc;
      const buffer = request.body.buffer;
      const example = await OpenTime.findOne({
        where: {
          date: date,
          location: loc
        },
        logging: (msg) => request.log.info(msg)
      });
      await OpenTime.update({
        buffer: buffer,
        available: sequelize.literal(`available + ${parseInt(buffer - example.buffer)}`)
      }, {
        where: {
          date: date,
          location: loc
        },
        logging: (msg) => request.log.info(msg)
      });
      response.send({success: true});
    } catch(err) {
      request.log.error(`error setting day buffer ${request.body.uid}`);
      request.log.error(err.stack);
      response.send({ success: false });
    }
  } else {
    request.log.error('Not authed');
    response.status(401).send();
  }
});

router.get('/settings', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 30) {
    try {
      const settings = await Settings.findOne({
        attributes: {
          exclude: ['accesstoken', 'refreshtoken', 'EmailAccessToken', 'EmailRefreshToken']
        },
        logging: (msg) => request.log.info(msg)
      });
      response.send({success: true, settings});
    } catch(err) {
      request.log.error(err.stack);
      response.send({ success: false });
    }
  } else {
    request.log.error('Not authed');
    response.status(401).send();
  }
});

router.patch('/settings', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const level = (await Admin.findOne({where: {calnetid: calnetid}, logging: (msg) => request.log.info(msg)})).level;
  if(!!level && level >= 30) {
    try {
      const {accesstoken, refreshtoken, EmailAccessToken, EmailRefreshToken, ...rest} = request.body;
      await Settings.update({
        ...rest
      }, {
        where: {},
        logging: (msg) => request.log.info(msg)
      });
      response.send({success: true});
    } catch(err) {
      request.log.error(err.stack);
      response.send({ success: false });
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
