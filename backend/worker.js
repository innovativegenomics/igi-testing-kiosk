const env = process.env.NODE_ENV || 'development';
const dbConfig = require(__dirname + '/config/config.json')[env];
const config = require('./config/keys');
const { Logger, makeWorkerUtils, run } = require('graphile-worker');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config.sendgrid.key);
const twilio = new (require('twilio'))(config.twilio.accountSid, config.twilio.authToken);
const moment = require('moment');
const short = require('short-uuid');

const { User, Settings, Day, Slot, Location, OpenTime, sequelize, Sequelize } = require('./models');
const Op = Sequelize.Op;

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
      const openTime = await OpenTime.findOne({
        where: {
          starttime: moment(time).toDate(),
          location: location
        },
        include: Location,
        logging: (msg) => helpers.logger.info(msg)
      });
      const status = await sgMail.send({
        to: user.email,
        from: config.sendgrid.from,
        replyTo: config.sendgrid.replyTo,
        templateId: 'd-8fdf653f576545539db3cfb2aef7fa71',
        dynamicTemplateData: {
          location: openTime.Location.name,
          locationlink: openTime.Location.map,
          starttime: moment(time).format('h:mm A'),
          endtime: moment(time).add(openTime.window, 'minute').format('h:mm A'),
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
      const openTime = await OpenTime.findOne({
        where: {
          starttime: moment(time),
          location: location
        },
        include: Location,
        logging: (msg) => helpers.logger.info(msg)
      });
      const status = await twilio.messages.create({
        body: `Testing Appointment Confirmation for ${moment(time).format('MMMM Do')} 
Please arrive between ${moment(time).format('h:mm A')} and ${moment(time).add(openTime.window, 'minute').format('h:mm A')} at location ${openTime.Location.name}. 
To view a map to this location, visit the following link ${openTime.Location.map}. 
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
            time: moment(time).format('h:mm A, MMMM Do'),
            qrimg: `https://igi-fast.berkeley.edu/api/emails/qrimg?uid=${uid}`,
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
            time: moment(time).format('h:mm A, MMMM Do'),
            qrimg: `https://igi-fast.berkeley.edu/api/emails/qrimg?uid=${uid}`,
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
  externalRequestEmail: async (payload, helpers) => {
    const { email, name } = payload;
    try {
      const status = await sgMail.send({
        to: email,
        from: config.sendgrid.from,
        replyTo: config.sendgrid.replyTo,
        templateId: 'd-ad83a71a4bee4da9b087c65a1dc3cd1c',
        dynamicTemplateData: {
          name: name
        }
      });
      helpers.logger.info('Sent email');
      helpers.logger.info(status);
    } catch(err) {
      helpers.logger.error(`Could not send email`);
      helpers.logger.error(err);
    }
  },
  externalUserApproveEmail: async (payload, helpers) => {
    const { email, name, uid } = payload;
    try {
      const status = await sgMail.send({
        to: email,
        from: config.sendgrid.from,
        replyTo: config.sendgrid.replyTo,
        templateId: 'd-5d6eefc43e4e4b1eafb308409bf5c38c',
        dynamicTemplateData: {
          name: name,
          uid: uid
        }
      });
      helpers.logger.info('Sent email');
      helpers.logger.info(status);
    } catch(err) {
      helpers.logger.error(`Could not send email`);
      helpers.logger.error(err);
    }
  },
  externalUserRejectEmail: async (payload, helpers) => {
    const { email, name } = payload;
    try {
      const status = await sgMail.send({
        to: email,
        from: config.sendgrid.from,
        replyTo: config.sendgrid.replyTo,
        templateId: 'd-6dfb97a179b64a9c92e85b1c59c7092a',
        dynamicTemplateData: {
          name: name
        }
      });
      helpers.logger.info('Sent email');
      helpers.logger.info(status);
    } catch(err) {
      helpers.logger.error(`Could not send email`);
      helpers.logger.error(err);
    }
  },
  externalUserForgotEmail: async (payload, helpers) => {
    const { email, uid, name } = payload;
    try {
      const status = await sgMail.send({
        to: email,
        from: config.sendgrid.from,
        replyTo: config.sendgrid.replyTo,
        templateId: 'd-575c8c658e9541728bc683dce3c9ee37',
        dynamicTemplateData: {
          name: name,
          uid: uid
        }
      });
      helpers.logger.info('Sent email');
      helpers.logger.info(status);
    } catch(err) {
      helpers.logger.error(`Could not send email`);
      helpers.logger.error(err);
    }
  },
  rescheduleUsers: async (payload, helpers) => {
    const t = await sequelize.transaction({logging: (msg) => helpers.logger.info(msg)});
    try {
      const expired = await User.findAll({
        where: {
          [Op.or]: {
            availableEnd: {
              [Op.lte]: moment().startOf('week').toDate(),
              [Op.not]: null
            },
            availableStart: {
              [Op.lt]: moment().startOf('week').toDate()
            }
          }
        },
        include: [{
          model: Slot,
          where: {
            current: true
          },
          required: false
        }],
        transaction: t,
        logging: (msg) => helpers.logger.info(msg)
      });
      const promises = [];
      expired.forEach(user => {
        promises.push((async () => {
          try {
            if(!user.Slots[0]) {
              user.availableStart = moment().startOf('week').toDate();
              user.availableEnd = null;
              await user.save();
            } else {
              if(!moment(user.Slots[0].time).isAfter(moment().startOf('week'))) {
                user.Slots[0].current = false;
                await user.Slots[0].save();
              }
              if(!user.Slots[0].completed) {
                user.availableStart = moment().startOf('week').toDate();
                user.availableEnd = null;
                await user.save();
              } else {
                user.availableStart = moment().startOf('week').add(1, 'week').toDate();
                user.availableEnd = moment().startOf('week').add(2, 'week').toDate();
                await user.save();
              }
            }
            try {
              const status = await sgMail.send({
                to: user.email,
                from: config.sendgrid.from,
                replyTo: config.sendgrid.replyTo,
                templateId: 'd-d9409e99ebd3421ab736539b8e49b5e5',
                dynamicTemplateData: {
                  week: moment(user.availableStart).format('MMMM Do')
                }
              });
            } catch(err) {
              helpers.logger.error(`Error sending reschedule email to ${user.calnetid}`);
              helpers.logger.error(err);
            }
          } catch(err) {
            helpers.logger.error(`Error rescheduling user ${user.calnetid}`);
            helpers.logger.error(err.stack);
          }
        })());
      });
      await Promise.all(promises);
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
  airQualityCancellation: async (payload, helpers) => {
    const { email, name } = payload;
    try {
      const status = await sgMail.send({
        to: email,
        from: config.sendgrid.from,
        replyTo: config.sendgrid.replyTo,
        templateId: 'd-7c98853435e94620b999c841e2853973',
        dynamicTemplateData: {
          name: name
        }
      });
      helpers.logger.info('Sent email');
      helpers.logger.info(status);
    } catch(err) {
      helpers.logger.error(`Could not send email`);
      helpers.logger.error(err);
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

module.exports.scheduleExternalRequestEmail = async (params = { email, name }) => {
  await workerUtils.addJob('externalRequestEmail', params);
}

module.exports.scheduleExternalUserApproveEmail = async (params = { email, name, uid }) => {
  await workerUtils.addJob('externalUserApproveEmail', params);
}

module.exports.scheduleExternalUserRejectEmail = async (params = { email, name }) => {
  await workerUtils.addJob('externalUserRejectEmail', params);
}

module.exports.scheduleExternalUserForgotEmail = async (params = { email, uid, name }) => {
  await workerUtils.addJob('externalUserForgotEmail', params);
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
  const user = await User.findOne({
    where: {
      calnetid: params.calnetid
    },
    logging: (msg) => pino.info(msg)
  });
  await workerUtils.withPgClient(async pgClient => {
    await pgClient.query('select graphile_worker.remove_job($1)', [`${user.email}`]);
  });
  await workerUtils.addJob('appointmentReminderEmail', params, {
    runAt: params.time.clone().subtract(2, 'hour'),
    jobKey: `${params.calnetid}-reminder-email`,
    queueName: 'reminderEmails'
  });
}

module.exports.scheduleAppointmentReminderText = async (params = { calnetid, time, uid }) => {
  const user = await User.findOne({
    where: {
      calnetid: params.calnetid
    },
    logging: (msg) => pino.info(msg)
  });
  await workerUtils.withPgClient(async pgClient => {
    await pgClient.query('select graphile_worker.remove_job($1)', [`${user.phone}`]);
  });
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

module.exports.scheduleAirQualityCancellation = async (params = { email, name }) => {
  await workerUtils.addJob('airQualityCancellation', params);
}
