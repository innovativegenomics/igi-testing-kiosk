process.env.TZ = 'America/Los_Angeles';

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
let versionHash;
try {
  versionHash = fs.readFileSync(require('./config/keys').elastic.hashFile).toString();
} catch(err) {
  versionHash = 'null';
}
const pinoElastic = require('pino-elasticsearch')({
  index: `server-${versionHash}`,
  consistency: 'one',
  node: require('./config/keys').elastic.node,
  'es-version': 7,
  'flush-bytes': 1000
});
const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' }, (process.env.NODE_ENV==='production'?pinoElastic:undefined));
const short = require('short-uuid');
const ExpressPinoLogger = require('express-pino-logger');

const { sequelize } = require('./models');
const users = require('./routes/api/users');
const slots = require('./routes/api/slots');
const tubes = require('./routes/api/tubes');
const admin = require('./routes/api/admin');
const emails = require('./routes/api/emails');
const slack = require('./routes/api/slack');
const utils = require('./routes/api/utils');

const { startWorker, scheduleRescheduleUsers } = require('./worker');

const app = express();

// DB Config
// verify database
module.exports = (async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await startWorker();
    await scheduleRescheduleUsers();
    pino.info('database initialized successfully!');

    const rawBodySaver = (req, res, buf, encoding) => {
      if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
      }
    }
    
    // Bodyparser middleware
    app.use(
      bodyParser.urlencoded({
        verify: rawBodySaver,
        extended: false
      })
    );
    app.use(bodyParser.json({verify: rawBodySaver}));
    
    var sess = {
      store: new (require('express-session-sequelize')(session.Store))({ db: sequelize }),
      secret: require('./config/keys').secretKey,
      name: 'sessionId',
      cookie: {
        secure: false,
      },
      saveUninitialized: false,
      resave: false,
    };
    if (process.env.NODE_ENV === 'production') {
      app.set('trust proxy', 1);
      sess.cookie.secure = true;
    }
    app.use(session(sess));
    let expressPino = ExpressPinoLogger({
      logger: pino,
      genReqId: (req) => (
        short.generate()
      ),
      // serializers: {
      //   req: (req) => ({
      //     method: req.method,
      //     url: req.url,
      //     calnetid: req.raw.session.cas_user||null,
      //   }),
      // },
      reqCustomProps: req => {
        return {
          calnetid: req.session.cas_user||null
        };
      }
    });
    app.use(expressPino);
    app.disable('x-powered-by');

    app.use('/api/users', users);
    app.use('/api/slots', slots);
    app.use('/api/tubes', tubes);
    app.use('/api/admin', admin);
    app.use('/api/emails', emails);
    app.use('/api/slack', slack);
    app.use('/api/utils', utils);
    return app;
  } catch (err) {
    pino.fatal('Database initialization error!');
    pino.fatal(err.stack);
    process.exit();
  }
});
