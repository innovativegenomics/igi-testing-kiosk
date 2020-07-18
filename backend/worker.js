const env = process.env.NODE_ENV || 'development';
const dbConfig = require(__dirname + './config/config.json')[env];
const config = require('./config/keys');
const { Logger, run } = require('graphile-worker');
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
      helpers.logging.info('Sent email');
    } catch(err) {
      helpers.logging.error(`Could not send email`);
      helpers.logging.error(err);
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
          locationlink: settings.locationlinks[settings.indexOf(location)],
          starttime: moment(time).format('h:mm A, MMMM Do'),
          endtime: moment(time).add(day.window, 'minute').format('h:mm A, MMMM Do'),
          day: moment(time).format('MMMM Do'),
          qrlink: `https://igi-fast.berkeley.edu/qrcode?uid=${uid}`,
          qrimg: `https://igi-fast.berkeley.edu/api/emails/qrimg?uid=${uid}`,
        }
      });
      helpers.logging.info('Sent email');
    } catch(err) {
      helpers.logging.error(`Could not send email`);
      helpers.logging.error(err);
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
Please arrive between ${moment(time).format('h:mm A, MMMM Do')} and ${moment(time).add(day.window, 'minute').format('h:mm A, MMMM Do')} at location ${location}. 
To view a map to this location, visit the following link ${settings.locationlinks[settings.indexOf(location)]}. 
When you arrive, please present the QR code at the following link: https://igi-fast.berkeley.edu/qrcode?uid=${uid}. 
To change or cancel this appointment, log into your testing account.`,
        to: user.phone,
        from: config.twilio.sender
      });
      helpers.logging.info('Sent text');
    } catch(err) {
      helpers.logging.error(`Could not send text`);
      helpers.logging.error(err);
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
      });
      helpers.logging.info('Sent email');
    } catch(err) {
      helpers.logging.error(`Could not send email`);
      helpers.logging.error(err);
    }
  },
  appointmentReminderEmail: async (payload, helpers) => {
    const { calnetid, time } = payload;
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
        templateId: 'd-be653a90c94b4c50ba124180b9b6a739',
        dynamicTemplateData: {
          time: moment(time).format('h:mm A, MMMM Do')
        }
      });
      helpers.logging.info('Sent email');
    } catch(err) {
      helpers.logging.error(`Could not send email`);
      helpers.logging.error(err);
    }
  },
  appointmentReminderText: async (payload, helpers) => {
    const { calnetid, time } = payload;
    try {
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
      helpers.logging.info('Sent text');
    } catch(err) {
      helpers.logging.error(`Could not send text`);
      helpers.logging.error(err);
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
          } catch(err) {
            helpers.logger.error('failed to send email to user');
            helpers.logger.error(err);
          }
        })
      });
      await Promise.all(promises);
      await promiseChain;
      await t.commit();
    } catch(err) {
      helpers.logger.error(`Can not update schedules`);
      helpers.logger.error(err);
      await t.rollback();
    }

    await helpers.addJob('rescheduleUsers', {}, {runAt: moment().startOf('week').add(1, 'week').add(1, 'minute').toDate(), jobKey: 'reschedule', queueName: 'rescheduleQueue'});
  },
};

module.exports.startWorker = async () => {
  const runner = await run({
    connectionString: `postgres://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
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
  return runner;
}


