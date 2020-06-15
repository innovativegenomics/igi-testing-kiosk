const express = require('express');
const router = express.Router();
const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const moment = require('moment');
const short = require('short-uuid');

const { sequelize, User, Slot, Settings } = require('../../models');
const { newPatient } = require('../../lims');
const cas = require('../../cas');
const { scheduleSignupEmail } = require('../../scheduler');

/**
 * Logs in existing and new users
 * If the users already exists, it directs them to the dashboard.
 * If the user is new, it directs them to the new user page.
 */
router.get('/login', cas.bounce, async (request, response) => {
  const calnetid = request.session.cas_user;
  const t = await sequelize.transaction();
  const user = await User.findOne({ where: { calnetid: calnetid }, transaction: t });
  if (user) {
    user.lastlogin = moment().toDate();
    await user.save();
    response.redirect('/dashboard');
  } else {
    if (!require('../../config/keys').newusers) {
      pino.error(`user with calnetid ${calnetid} not authorized`);
      request.session.destroy();
      response.status(401).send('Unauthorized user');
    } else {
      response.redirect('/newuser');
    }
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
  pino.debug(`trying to get profile for user ${calnetid}`);
  const profile = await User.findOne({
    attributes: ['firstname',
      'middlename',
      'lastname',
      'email',
      'phone'], where: { calnetid: calnetid }
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
  const t1 = await sequelize.transaction();
  const count = await User.count({ where: { calnetid: calnetid }, transaction: t1 });
  pino.info(`User count for ${calnetid}: ${count}`);
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
      }, { transaction: t1 });
      await user.createSlot({
        calnetid: calnetid,
        time: moment().startOf('week').toDate(),
        uid: short().new()
      }, { transaction: t1 });
      await t1.commit();
      response.send({ success: true });
    } catch (err) {
      pino.error(`error creating user profile for ${calnetid}`);
      pino.error(err);
      await t1.rollback();
      response.send({ success: false, error: 'SERVER_ERROR' });
    }
    
    try {
      await scheduleSignupEmail(request.body.email);
    } catch (err) {
      pino.error(`Coundn't schedule signup email for user ${calnetid}`);
      pino.error(err);
    }

    const t2 = await sequelize.transaction();
    const settings = await Settings.findOne({transaction: t2});
    try {
      const res = await newPatient(request.body, settings.accesstoken, settings.refreshtoken);
      if (res.accesstoken) {
        settings.accesstoken = res.accesstoken;
        await settings.save();
      }
      if(res.patient_id) {
        const user = User.findOne({where: {calnetid: calnetid}, transaction: t2});
        user.patientid = res.patient_id;
        await user.save();
      }
      await t2.commit();
    } catch (err) {
      pino.error('Can not add new LIMs patient');
      pino.error(err);
      await t2.rollback();
    }
  }
});

/**
 * Quick and dirty way for the frontend to know if the server is dev mode
 */
router.get('/devmode', (request, response) => {
  response.json({ devmode: (process.env.NODE_ENV !== 'production') });
});

module.exports = router;
