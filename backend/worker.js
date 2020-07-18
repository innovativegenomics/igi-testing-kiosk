const env = process.env.NODE_ENV || 'development';
const dbConfig = require(__dirname + '/config/config.json')[env];
const config = require('./config/keys');
const { Logger, makeWorkerUtils, run } = require('graphile-worker');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config.sendgrid.key);
const twilio = new (require('twilio'))(config.twilio.accountSid, config.twilio.authToken);
const moment = require('moment');
const short = require('short-uuid');

const { User, Settings, Day, Slot, sequelize } = require('./models');

const fs = require('fs');
let versionHash;
try {
  versionHash = fs.readFileSync(config.elastic.hashFile).toString();
} catch(err) {
  versionHash = 'null';
}
const pinoElastic = require('pino-elasticsearch')({
  index: `worker-${versionHash}`,
  consistency: 'one',
  node: config.elastic.node,
  'es-version': 7,
  'flush-bytes': 1000
});
const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' }, (process.env.NODE_ENV==='production'?pinoElastic:undefined));

let workerUtils;
let runner;

const logFactory = (scope) => {
  const levels = {
    error: 50,
    warning: 40,
    info: 30,
    debug: 20
  };
  return (level, message, meta) => {
    const numericLevel = levels[level];
    switch(numericLevel) {
      case 50:
        pino.error({
          msg: message,
          scope: scope,
          details: meta,
        });
        break;
      case 40:
        pino.warn({
          msg: message,
          scope: scope,
          details: meta,
        });
        break;
      case 30:
        pino.info({
          msg: message,
          scope: scope,
          details: meta,
        });
        break;
      case 20:
        pino.debug({
          msg: message,
          scope: scope,
          details: meta,
        });
        break;
    }
  };
}

const tasks = {
  signupEmail: async (payload, helpers) => {
    const { calnetid } = payload;
    try {
      const user = await User.findOne({
        where: {
          calnetid: calnetid
        },
        logging: (msg) => helpers.logger.info(msg)
      });

      const status = await sgMail.send({
        to: user.email,
        from: config.sendgrid.from,
        replyTo: config.sendgrid.replyTo,
        templateId: 'd-5b3516a827fb4eec94856101bf109714',
        dynamicTemplateData: {
          name: `${user.firstname} ${user.lastname}`
        }
      });
      helpers.logger.info('Sent email');
      helpers.logger.info(status);
    } catch(err) {
      helpers.logger.error(`Could not send email`);
      helpers.logger.error(err);
    }
  },
  slotConfirmEmail: async (payload, helpers) => {
    const { calnetid, uid, time, location } = payload;
    try {
      const user = await User.findOne({
        where: {
          calnetid: calnetid
        },
        logging: (msg) => helpers.logger.info(msg)
      });
      const settings = await Settings.findOne({logging: (msg) => helpers.logger.info(msg)});
      const day = await Day.findOne({
        where: {
          date: moment(time).startOf('day').toDate()
        },
        logging: (msg) => helpers.logger.info(msg)
      });
      const status = await sgMail.send({
        to: user.email,
        from: config.sendgrid.from,
        replyTo: config.sendgrid.replyTo,
        templateId: 'd-8fdf653f576545539db3cfb2aef7fa71',
        dynamicTemplateData: {
          location: location,
          locationlink: settings.locationlinks[settings.locations.indexOf(location)],
          starttime: moment(time).format('h:mm A'),
          endtime: moment(time).add(day.window, 'minute').format('h:mm A'),
          day: moment(time).format('MMMM Do'),
          qrlink: `https://igi-fast.berkeley.edu/qrcode?uid=${uid}`,
          qrimg: `https://igi-fast.berkeley.edu/api/emails/qrimg?uid=${uid}`,
        }
      });
      helpers.logger.info('Sent email');
      helpers.logger.info(status);
    } catch(err) {
      helpers.logger.error(`Could not send email`);
      helpers.logger.error(err.stack);
    }
  },
  slotConfirmText: async (payload, helpers) => {
    const { calnetid, uid, time, location } = payload;
    try {
      const user = await User.findOne({
        where: {
          calnetid: calnetid
        },
        logging: (msg) => helpers.logger.info(msg)
      });
      const settings = await Settings.findOne({logging: (msg) => helpers.logger.info(msg)});
      const day = await Day.findOne({
        where: {
          date: moment(time).startOf('day').toDate()
        },
        logging: (msg) => helpers.logger.info(msg)
      });
      const status = await twilio.messages.create({
        body: `Testing Appointment Confirmation for ${moment(time).format('MMMM Do')} 
Please arrive between ${moment(time).format('h:mm A')} and ${moment(time).add(day.window, 'minute').format('h:mm A')} at location ${location}. 
To view a map to this location, visit the following link ${settings.locationlinks[settings.locations.indexOf(location)]}. 
When you arrive, please present the QR code at the following link: https://igi-fast.berkeley.edu/qrcode?uid=${uid}. 
To change or cancel this appointment, log into your testing account.`,
        to: user.phone,
        from: config.twilio.sender
      });
      helpers.logger.info('Sent text');
      helpers.logger.info(status);
    } catch(err) {
      helpers.logger.error(`Could not send text`);
      helpers.logger.error(err.stack);
    }
  },
  resultInstructionsEmail: async (payload, helpers) => {
    const { calnetid } = payload;
    try {
      const user = await User.findOne({
        where: {
          calnetid: calnetid
        },
        logging: (msg) => helpers.logger.info(msg)
      });

      const status = await sgMail.send({
        to: user.email,
        from: config.sendgrid.from,
        replyTo: config.sendgrid.replyTo,
        templateId: 'd-56a60717a4dd48fbba8f22e4316152e7',
        dynamicTemplateData: {
          name: `${user.firstname} ${user.lastname}`
        }
      });
      helpers.logger.info('Sent email');
      helpers.logger.info(status);
    } catch(err) {
      helpers.logger.error(`Could not send email`);
      helpers.logger.error(err.stack);
    }
  },
  appointmentReminderEmail: async (payload, helpers) => {
    const { calnetid, time, uid } = payload;
    try {
      if(!calnetid) {
        const status = await sgMail.send({
          to: payload.email,
          from: config.sendgrid.from,
          replyTo: config.sendgrid.replyTo,
          templateId: 'd-be653a90c94b4c50ba124180b9b6a739',
          dynamicTemplateData: {
            time: moment(time).format('h:mm A, MMMM Do')
          }
        });
        helpers.logger.info('Sent legacy email');
        helpers.logger.info(status);
      } else {
        const user = await User.findOne({
          where: {
            calnetid: calnetid
          },
          logging: (msg) => helpers.logger.info(msg)
        });

        const status = await sgMail.send({
          to: user.email,
          from: config.sendgrid.from,
          replyTo: config.sendgrid.replyTo,
          templateId: 'd-be653a90c94b4c50ba124180b9b6a739',
          dynamicTemplateData: {
            time: moment(time).format('h:mm A, MMMM Do')
          }
        });
        helpers.logger.info('Sent email');
        helpers.logger.info(status);
      }
    } catch(err) {
      helpers.logger.error(`Could not send email`);
      helpers.logger.error(err.stack);
    }
  },
  appointmentReminderText: async (payload, helpers) => {
    const { calnetid, time, uid } = payload;
    try {
      if(!calnetid) {
        const status = await twilio.messages.create({
          body: `Reminder that you have a Covid 19 testing appointment in 30 minutes at ${moment(time).format('h:mm A')}! 
Make sure not to eat, drink, smoke, or chew gum 30 minutes before your appointment. Be sure to wear your mask, and bring the QR code you received. 
You can view your appointment by logging into https://igi-fast.berkeley.edu`,
          to: payload.number,
          from: config.twilio.sender
        });
        helpers.logger.info('Sent legacy text');
        helpers.logger.info(status);
      } else {
        const user = await User.findOne({
          where: {
            calnetid: calnetid
          },
          logging: (msg) => helpers.logger.info(msg)
        });

        const status = await twilio.messages.create({
          body: `Reminder that you have a Covid 19 testing appointment in 30 minutes at ${moment(time).format('h:mm A')}! 
  Make sure not to eat, drink, smoke, or chew gum 30 minutes before your appointment. Be sure to wear your mask, and bring the QR code you received. 
  You can view your appointment by logging into https://igi-fast.berkeley.edu`,
          to: user.phone,
          from: config.twilio.sender
        });
        helpers.logger.info('Sent text');
        helpers.logger.info(status);
      }
    } catch(err) {
      helpers.logger.error(`Could not send text`);
      helpers.logger.error(err.stack);
    }
  },
  rescheduleUsers: async (payload, helpers) => {
    const t = await sequelize.transaction({logging: (msg) => helpers.logger.info(msg)});
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
        logging: (msg) => helpers.logger.info(msg)
      });
      const beginning = moment().startOf('week');
      const promises = [];
      let promiseChain = Promise.resolve(0);
      expired.forEach((user, i) => {
        promises.push((async () => {
          if(user.Slots[0].location) {
            await user.createSlot({
              calnetid: user.calnetid,
              time: beginning.clone().add(1, 'week').toDate(),
              uid: short().new()
            }, {transaction: t, logging: (msg) => helpers.logger.info(msg)});
          } else {
            await user.createSlot({
              calnetid: user.calnetid,
              time: beginning.clone().toDate(),
              uid: short().new()
            }, {transaction: t, logging: (msg) => helpers.logger.info(msg)});
          }
        })());
        promiseChain = promiseChain.then(async () => {
          try {
            // send email
            const status = await sgMail.send({
              to: user.email,
              from: config.sendgrid.from,
              replyTo: config.sendgrid.replyTo,
              templateId: 'd-d9409e99ebd3421ab736539b8e49b5e5',
              dynamicTemplateData: {
                week: ((user.Slots[0].location)?beginning.clone().add(1, 'week'):beginning.clone()).format('MMMM Do')
              }
            });
            helpers.logger.info(`sent email to user ${user.email}`);
            helpers.logger.info(status);
          } catch(err) {
            helpers.logger.error(`failed to send email to user ${user.email}`);
            helpers.logger.error(err.stack);
          }
        })
      });
      await Promise.all(promises);
      await promiseChain;
      await t.commit();
    } catch(err) {
      helpers.logger.error(`Can not update schedules`);
      helpers.logger.error(err.stack);
      await t.rollback();
    }

    await helpers.addJob('rescheduleUsers', {}, {runAt: moment().startOf('week').add(1, 'week').add(1, 'minute').toDate(), jobKey: 'reschedule', queueName: 'rescheduleQueue'});
  },
  newAdminEmail: async (payload, helpers) => {
    const { email, uid } = payload;
    try {
      const status = await sgMail.send({
        to: email,
        from: config.sendgrid.from,
        replyTo: config.sendgrid.replyTo,
        templateId: 'd-bcea535bb5ec436eb94d1d389db26411',
        dynamicTemplateData: {
          signup: `${config.host}/api/admin/login?returnTo=${encodeURIComponent(config.host+'/api/admin/login?uid='+uid)}`
        }
      });
      helpers.logger.info('Sent email');
      helpers.logger.info(status);
    } catch(err) {
      helpers.logger.error(`Could not send email`);
      helpers.logger.error(err.stack);
    }
  },
};

module.exports.startWorker = async () => {
  const connectionString = `postgres://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${(process.env.POSTGRES_PORT?process.env.POSTGRES_PORT:5432)}/${dbConfig.database}`;
  console.log(connectionString);
  workerUtils = await makeWorkerUtils({
    connectionString: connectionString,
  });
  await workerUtils.migrate();
  runner = await run({
    connectionString: connectionString,
    logger: new Logger(logFactory),
    concurrency: 1,
    // Install signal handlers for graceful shutdown on SIGINT, SIGTERM, etc
    noHandleSignals: false,
    pollInterval: 1000,
    // you can set the taskList or taskDirectory but not both
    taskList: tasks,
    // or:
    //   taskDirectory: `${__dirname}/tasks`,
  });
}

module.exports.scheduleRescheduleUsers = async () => {
  await workerUtils.addJob('rescheduleUsers', {}, { runAt: moment().startOf('week').add(1, 'week').add(1, 'minute').toDate(), jobKey: 'reschedule', queueName: 'rescheduleQueue' });
}

module.exports.scheduleSlotConfirmText = async (params = { calnetid, uid, time, location }) => {
  await workerUtils.addJob('slotConfirmText', params);
}

module.exports.scheduleSlotConfirmEmail = async (params = { calnetid, uid, time, location }) => {
  await workerUtils.addJob('slotConfirmEmail', params);
}

module.exports.scheduleSignupEmail = async (params = { calnetid } ) => {
  await workerUtils.addJob('signupEmail', params);
}

module.exports.scheduleResultInstructionsEmail = async (params = { calnetid }) => {
  await workerUtils.addJob('resultInstructionsEmail', params);
}

module.exports.scheduleNewAdminEmail = async (params = { email, uid }) => {
  await workerUtils.addJob('newAdminEmail', params);
}

/**
 * 30 minute reminders
 * @param {string} email
 * @param {moment.Moment} slot - the time slot they signed up for
 */
module.exports.scheduleAppointmentReminderEmail = async (params = { calnetid, time, uid }) => {
  await workerUtils.addJob('appointmentReminderEmail', params, {
    runAt: params.time.clone().subtract(2, 'hour'),
    jobKey: `${params.calnetid}-reminder-email`,
    queueName: 'reminderEmails'
  });
}

module.exports.scheduleAppointmentReminderText = async (params = { calnetid, time, uid }) => {
  await workerUtils.addJob('appointmentReminderText', params, {
    runAt: params.time.clone().subtract(30, 'minute'),
    jobKey: `${params.calnetid}-reminder-text`,
    queueName: 'reminderTexts'
  });
}

module.exports.deleteAppointmentReminders = async (calnetid) => {
  const user = await User.findOne({
    where: {
      calnetid: calnetid
    },
    logging: (msg) => pino.info(msg)
  });
  await workerUtils.withPgClient(async pgClient => {
    await pgClient.query('select graphile_worker.remove_job($1)', [`${user.email}`]);
    await pgClient.query('select graphile_worker.remove_job($1)', [`${user.phone}`]);
    await pgClient.query('select graphile_worker.remove_job($1)', [`${calnetid}-reminder-email`]);
    await pgClient.query('select graphile_worker.remove_job($1)', [`${calnetid}-reminder-text`]);
  });
}
