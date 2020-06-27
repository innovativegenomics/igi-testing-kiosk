module.exports = async (payload, helpers) => {
  process.env.TZ = 'America/Los_Angeles';
  const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
  const short = require('short-uuid');
  const sendEmail = require('../email');

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
    expired.forEach(user => {
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
        try {
          const nextDate = (user.Slots[0].location?beginning.clone().add(1, 'week').format('dddd, MMMM D'):beginning.format('dddd, MMMM D'));
          const success = await sendEmail(user.email,
                                          `IGI FAST - Appointment Available Week of ${nextDate}`,
                                          `<h3>New testing appointment available for you during the week of ${nextDate}</h3>
                                          <p>You can schedule a specific time and location on our website <a href='${config.host}'>${config.host}</a>.</p>`);
          if(!success) {
            throw new Error('unsuccessful email');
          }
        } catch(err) {
          pino.warn(`error sending reschedule email to user ${user.calnetid}`);
          pino.warn(err);
        }
      })());
    });
    await Promise.all(promises);
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
