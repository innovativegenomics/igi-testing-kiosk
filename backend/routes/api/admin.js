const express = require('express');
const router = express.Router();
const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const { sequelize, Admin } = require('../../models');

const cas = require('../../cas');

router.get('/login', cas.bounce, async (request, response) => {
  const calnetid = request.session.cas_user;
  const uid = request.query.uid;
  const t = await sequelize.transaction();
  try {
    const user = await Admin.findOne({where: {calnetid: calnetid}, transaction: t});
    if(user) {
      await t.commit();
      request.session.usertype='admin';
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
    response.status(500);
  }
});

module.exports = router;
