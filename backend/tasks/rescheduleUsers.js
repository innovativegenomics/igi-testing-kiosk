module.exports = async (payload, helpers) => {
  process.env.TZ = 'America/Los_Angeles';
  const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
  const short = require('short-uuid');
  const { sendRawEmail } = require('../email');

  const { Pool } = require('pg');
  const env = process.env.NODE_ENV || 'development';
  const pgconfig = require('../config/config.json')[env];
  const pool = new Pool({
      user: pgconfig.username,
      host: pgconfig.host,
      database: pgconfig.database,
      password: pgconfig.password,
      port: pgconfig.port || process.env.POSTGRES_PORT || 5432,
  });
  const moment = require('moment');
  const { makeWorkerUtils } = require('graphile-worker');

  const { User, Slot, sequelize } = require('../models');
  const config = require('../config/keys');

  const t = await sequelize.transaction();
  try {
    const expired = await User.findAll({
      where: sequelize.literal(`(select max(time) from "Slots" as s where s.calnetid="User".calnetid)<'${moment().startOf('week').format()}'`),
      include: [
        {
          model: Slot,
          required: true,
          order: [['time', 'desc']],
          limit: 1
        }
      ],
      transaction: t,
    });
    const beginning = moment().startOf('week');
    const promises = [];
    let emails = [];
    let promiseChain = Promise.resolve(0);
    expired.forEach((user, i) => {
      promises.push((async () => {
        if(user.Slots[0].location) {
          await user.createSlot({
            calnetid: user.calnetid,
            time: beginning.clone().add(1, 'week').toDate(),
            uid: short().new()
          }, {transaction: t});
        } else {
          await user.createSlot({
            calnetid: user.calnetid,
            time: beginning.clone().toDate(),
            uid: short().new()
          }, {transaction: t});
        }
      })());
      emails.push(user.email);
      if(emails.length%100===0) {
        const tmpEmails = [...emails];
        promiseChain = promiseChain.then(async () => {
          try {
            // send email
            const message = {
              to: 'igi-fast@berkeley.edu',
              from: 'IGI FAST <igi-fast@berkeley.edu>',
              bcc: tmpEmails,
              subject: 'IGI FAST - New Appointments Open',
              html: `
              <h3>New testing appointment dates have opened for you!</h3>
              <p>You can view and schedule your new appointment at our website <a href='https://igi-fast.berkeley.edu'>igi-fast.berkeley.edu</a>.</p>
              `
            }
            await sendRawEmail(message);
          } catch(err) {
            pino.error('failed to send email to users');
            pino.error(err);
            pino.info({emails: emails});
          }
        }).then(() => {
          return new Promise((resolve) => {
            window.setTimeout(() => {
              resolve();
            }, 5000);
          });
        });
        emails = [];
      }
    });
    if(emails.length > 0) {
      const tmpEmails = [...emails];
      promiseChain = promiseChain.then(async () => {
        try {
          // send email
          const message = {
            to: 'igi-fast@berkeley.edu',
            from: 'IGI FAST <igi-fast@berkeley.edu>',
            bcc: tmpEmails,
            subject: 'IGI FAST - New Appointments Open',
            html: `
            <h3>New testing appointment dates have opened for you!</h3>
            <p>You can view and schedule your new appointment at our website <a href='https://igi-fast.berkeley.edu'>igi-fast.berkeley.edu</a>.</p>
            `
          }
          await sendRawEmail(message);
        } catch(err) {
          pino.error('failed to send email to users');
          pino.error(err);
          pino.info({emails: emails});
        }
      });
    }
    await Promise.all(promises);
    await promiseChain;
    await t.commit();
  } catch(err) {
    pino.error(`Can't update schedules`);
    pino.error(err);
    await t.rollback();
  }
  const workerUtils = await makeWorkerUtils({pgPool: pool});
  await workerUtils.addJob('rescheduleUsers', {}, {runAt: moment().startOf('week').add(1, 'week').add(1, 'minute').toDate(), jobKey: 'reschedule', queueName: 'rescheduleQueue'});
  await workerUtils.release();
  await pool.end();
}
