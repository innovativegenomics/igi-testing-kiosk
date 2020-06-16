module.exports = async (payload, helpers) => {
  process.env.TZ = 'America/Los_Angeles';
  const short = require('short-uuid');
  const nodemailer = require('nodemailer');

  const { Pool } = require('pg');
  const env = process.env.NODE_ENV || 'development';
  const pgconfig = require('../config/config.json')[env];
  const pool = new Pool({
      user: pgconfig.username,
      host: pgconfig.host,
      database: pgconfig.database,
      password: pgconfig.password,
      port: pgconfig.port || 5432,
  });
  const moment = require('moment');
  const { makeWorkerUtils } = require('graphile-worker');

  const { User, Slot, sequelize } = require('../models');
  const config = require('../config/keys');


  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.user,
      pass: config.email.pass
    }
  });

  const t = await sequelize.transaction();
  try {
    const expired = await User.findAll({
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
    for(var user of expired) {
      if(moment(user.Slots[0].time).isBefore(beginning)) {
        await user.createSlot({
          calnetid: user.calnetid,
          time: beginning.clone().add(1, 'week').toDate(),
          uid: short().new()
        }, {transaction: t});
        try {
          await transport.sendMail({
            from: config.email.user,
            to: user.email,
            subject: `IGI FAST - Appointment Available Week of ${beginning.format('dddd, MMMM D')}`,
            // text: 'Please enable html messages to view this email',
            html: `<h3>New testing appointment available for you during the week of ${beginning.format('dddd, MMMM D')}</h3>
                  <p>You can schedule a specific time and location on our website <a href='${config.host}'>${config.host}</a>.</p>`,
          });
        } catch(err) {
          console.error(`error sending reschedule email to user ${user.calnetid}`);
          console.error(err);
        }
      }
    }
    t.commit();
  } catch(err) {
    console.error(`Can't update schedules`);
    console.error(err);
    await t.rollback();
  }
  const workerUtils = await makeWorkerUtils({pgPool: pool});
  await workerUtils.addJob('rescheduleUsers', {}, {runAt: moment().startOf('week').add(1, 'week').add(1, 'minute'), jobKey: 'reschedule', queueName: 'rescheduleQueue'});
  await workerUtils.release();
  await pool.end();
}
