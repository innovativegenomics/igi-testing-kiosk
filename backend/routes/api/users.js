const express = require('express');
const router = express.Router();
// const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const moment = require('moment');
const bcrypt = require('bcrypt');
const short = require('short-uuid');
let Recaptcha;
if(process.env.NODE_ENV !== 'production') {
  Recaptcha = new (require('express-recaptcha').RecaptchaV3)('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe');
} else {
  Recaptcha = new (require('express-recaptcha').RecaptchaV3)(require('../../config/keys').recaptcha.siteKey, require('../../config/keys').recaptcha.secretKey);
}

const { sequelize, Sequelize, User, Slot, Day, Settings, ExternalUser } = require('../../models');
const Op = Sequelize.Op;
const { newPatient } = require('../../lims');
const cas = require('../../cas');
const { scheduleSignupEmail, scheduleExternalRequestEmail } = require('../../worker');

/**
 * Logs in existing and new users
 * If the users already exists, it directs them to the dashboard.
 * If the user is new, it directs them to the new user page.
 */
router.get('/login', cas.bounce, async (request, response) => {
  const calnetid = request.session.cas_user;
  const t = await sequelize.transaction({logging: (msg) => request.log.info(msg)});
  try {
    const user = await User.findOne({ where: { calnetid: calnetid }, transaction: t, logging: (msg) => request.log.info(msg) });
    if (user) {
      request.log.info('user exists, updating last login');
      user.lastlogin = moment().toDate();
      await user.save();
      request.session.usertype='patient';
      response.redirect('/dashboard');
    } else {
      if (!require('../../config/keys').newusers) {
        request.log.error(`user with calnetid ${calnetid} not authorized`);
        request.session.destroy((err) => {if(err) {request.log.error(`Couldn't destroy session for user ${calnetid}`); request.log.error(err)}});
        response.status(401).send('Unauthorized user');
      } else {

        request.session.usertype='patient';
        response.redirect('/newuser');
      }
    }
    await t.commit();
  } catch(err) {
    await t.rollback();
  }
});

/**
 * Logs out users
 */
router.get('/logout', cas.logout);

/**
 * Returns selected profile information for a given user
 * request format: {}
 * response format:
 * {
 *   success: true,
 *   user: {
 *     firstname: string,
 *     middlename: string|null,
 *     lastname: string,
 *     email: string,
 *     phone: string|null,
 *   }
 * }
 */
router.get('/profile', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  request.log.debug(`trying to get profile for user ${calnetid}`);
  const profile = await User.findOne({
    attributes: ['firstname',
      'middlename',
      'lastname',
      'email',
      'phone',
      'calnetid',
      'questions',
      'reconsented'], where: { calnetid: calnetid },
      logging: (msg) => request.log.info(msg)
  });
  if (profile) {
    response.send({ success: true, user: profile });
  } else {
    response.send({ success: false, user: {} });
  }
});

/**
 * Sets all the profile information for a user
 * request format:
 * {
 *   firstname: string,
 *   middlename: string|null,
 *   lastname: string,
 *   dob: string,
 *   street: string,
 *   city: string,
 *   state: string,
 *   county: string,
 *   zip: string,
 *   sex: string,
 *   pbuilding: string,
 *   email: string,
 *   phone: string|null,
 * }
 * response format:
 * {success: true|false}
 */
router.post('/profile', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  const t1 = await sequelize.transaction({logging: (msg) => request.log.info(msg)});
  const count = await User.count({ where: { calnetid: calnetid }, transaction: t1, logging: (msg) => request.log.info(msg) });
  request.log.info(`User count for ${calnetid}: ${count}`);
  if (count > 0) {
    response.send({ success: false, error: 'USER_EXISTS' });
    await t1.commit();
  } else {
    try {
      const user = await User.create({
        firstname: request.body.firstname,
        middlename: request.body.middlename,
        lastname: request.body.lastname,
        calnetid: calnetid,
        dob: moment.utc(request.body.dob).format('YYYY-MM-DD'),
        street: request.body.street,
        city: request.body.city,
        state: request.body.state,
        county: request.body.county,
        zip: request.body.zip,
        sex: request.body.sex,
        pbuilding: request.body.pbuilding,
        email: request.body.email,
        phone: request.body.phone,
        questions: request.body.questions,
        reconsented: true
      }, { transaction: t1, logging: (msg) => request.log.info(msg) });
      const settings = await Settings.findOne({logging: (msg) => request.log.info(msg)});
      // Figure out which week this person should be assigned to
      let week = moment().startOf('week');
      while(true) {
        const days = await Day.findAll({
          where: {
            date: {
              [Op.gte]: week.toDate(),
              [Op.lt]: week.clone().add(1, 'week').toDate()
            }
          },
          order: [['date', 'asc']],
          transaction: t1,
          logging: (msg) => request.log.info(msg)
        });
        let available = 0;
        days.forEach(v => {
          available += settings.locations.length * v.buffer * Math.floor(moment.duration({hours: v.endhour-v.starthour, minutes: v.endminute-v.startminute}).asMinutes() / v.window);
        });
        const taken = await Slot.count({
          where: {
            time: {
              [Op.gte]: week.toDate(),
              [Op.lt]: week.clone().add(1, 'week').toDate()
            }
          },
          transaction: t1,
          logging: (msg) => request.log.info(msg)
        });
        request.log.debug(`available: ${available} taken: ${taken} between ${week.format()} and ${week.clone().add(1, 'week').format()}`);
        if(available === 0) {
          break;
        }
        if(taken < available) {
          let lastDay = days[days.length-1];
          if(moment(lastDay.date).set('hour', lastDay.endhour).set('minute', lastDay.endminute).isBefore(moment())) {
            week = week.add(1, 'week');
          } else {
            break;
          }
        } else {
          week = week.add(1, 'week');
        }
      }

      await user.createSlot({
        calnetid: calnetid,
        time: week.toDate(),
        uid: short().new()
      }, { transaction: t1, logging: (msg) => request.log.info(msg) });

      await t1.commit();
      response.send({ success: true });
    } catch (err) {
      request.log.error(`error creating user profile for ${calnetid}`);
      request.log.error(err);
      await t1.rollback();
      response.send({ success: false, error: 'SERVER_ERROR' });
    }
    
    try {
      await scheduleSignupEmail({
        calnetid: calnetid
      });
    } catch (err) {
      request.log.error(`Coundn't schedule signup email for user ${calnetid}`);
      request.log.error(err);
    }

    const t2 = await sequelize.transaction({logging: (msg) => request.log.info(msg)});
    const settings = await Settings.findOne({transaction: t2, logging: (msg) => request.log.info(msg)});
    try {
      const res = await newPatient(request.body, settings.accesstoken, settings.refreshtoken, request.log);
      if (res.accesstoken) {
        settings.accesstoken = res.accesstoken;
        await settings.save();
      }
      if(res.patient_id) {
        const user = await User.findOne({where: {calnetid: calnetid}, transaction: t2, logging: (msg) => request.log.info(msg)});
        user.patientid = res.patient_id;
        await user.save();
      }
      await t2.commit();
    } catch (err) {
      request.log.error('Can not add new LIMs patient');
      request.log.error(err);
      await t2.rollback();
    }
  }
});

router.post('/reconsent', cas.block, async (request, response) => {
  const calnetid = request.session.cas_user;
  try {
    const user = await User.findOne({
      where: {
        calnetid: calnetid
      },
      logging: (msg) => request.log.info(msg)
    });
    if(user.reconsented) {
      throw new Error('User already reconsented');
    }
    user.questions = request.body.questions;
    user.reconsented = true;
    await user.save();
    response.send({success: true});
  } catch(err) {
    request.log.error(`Can't reconsent user ${calnetid}`);
    request.log.error(err);
    response.send({success: false});
  }
});

router.post('/external/signup', Recaptcha.middleware.verify, async (request, response) => {
  if(!request.recaptcha.error) {
    request.log.info(`recaptcha score: ${request.recaptcha}`);
    if(request.recaptcha.data.score < 0.5) {
      request.log.info('recaptcha score less than 0.5');
      response.status(401);
    } else {
      request.log.info('recaptcha score greater than or equal to 0.5');
      try {
        await ExternalUser.create({
          email: request.body.email,
          name: request.body.name,
          calnetid: `E${short().new().substring(0, 8)}`,
          uid: short().new(),
          jobDescription: request.body.jobDescription,
          employer: request.body.employer,
          workFrequency: request.body.workFrequency,
        }, {logging: (msg) => request.log.info(msg)});
        // schedule email
        try {
          await scheduleExternalRequestEmail({
            email: request.body.email,
            name: request.body.name
          });
        } catch(err) {
          request.log.error(`error sending signup email to ${request.body.name}`);
          request.log.error(err.stack);
        }
        response.send({success: true});
      } catch(err) {
        request.log.error('error creating new external user');
        response.send({success: false});
      }
    }
  } else {
    request.log.error(`Could not get recaptcha response`);
    request.log.error(request.recaptcha.error);
    response.status(500).send();
  }
});

router.post('/external/create', Recaptcha.middleware.verify, async (request, response) => {
  if(!request.recaptcha.error) {
    request.log.info(`recaptcha score: ${request.recaptcha.data.score}`);
    if(request.recaptcha.data.score < 0.5) {
      request.log.info('recaptcha score less than 0.5');
      response.status(401);
    } else {
      request.log.info('recaptcha score greater than or equal to 0.5');
      try {
        const extUser = await ExternalUser.findOne({
          attributes: ['password', 'uid', 'id'],
          where: {
            uid: request.body.uid
          },
          logging: (msg) => request.log.info(msg)
        });
        if(!extUser) {
          response.send({success: false});
          return;
        }
        if(extUser.password) {
          response.send({success: false});
          return;
        }
        const hash = await bcrypt.hash(request.body.password, 10);
        extUser.password = hash;
        await extUser.save();
        response.send({success: true});
      } catch(err) {
        request.log.error('error creating new external user');
        request.log.error(err.stack);
        response.send({success: false});
      }
    }
  } else {
    request.log.error(`Could not get recaptcha response`);
    request.log.error(request.recaptcha.error);
    response.status(500).send();
  }
});

router.post('/external/login', Recaptcha.middleware.verify, async (request, response) => {
  if(!request.recaptcha.error) {
    request.log.info(`recaptcha score: ${request.recaptcha.data.score}`);
    if(request.recaptcha.data.score < 0.5) {
      request.log.info('recaptcha score less than 0.5');
      response.status(401);
    } else {
      request.log.info('recaptcha score greater than or equal to 0.5');
      try {
        const extUser = await ExternalUser.findOne({
          attributes: ['password', 'email', 'id', 'calnetid'],
          where: {
            email: request.body.email
          },
          logging: (msg) => request.log.info(msg)
        });
        if(!extUser) {
          response.send({success: false});
          return;
        }
        if(!extUser.password) {
          response.send({success: false});
          return;
        }
        const same = await bcrypt.compare(request.body.password, extUser.password);
        if(same) {
          request.session.cas_user = extUser.calnetid;
          response.send({success: true});
        } else {
          response.send({success: false});
        }
      } catch(err) {
        request.log.error('error creating new external user');
        request.log.error(err.stack);
        response.send({success: false});
      }
    }
  } else {
    request.log.error(`Could not get recaptcha response`);
    request.log.error(request.recaptcha.error);
    response.status(500).send();
  }
});



/**
 * Quick and dirty way for the frontend to know if the server is dev mode
 */
router.get('/devmode', (request, response) => {
  response.json({ devmode: (process.env.NODE_ENV !== 'production') });
});

module.exports = router;
