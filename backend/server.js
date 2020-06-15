const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
const expressPino = require('express-pino-logger')();

process.env.TZ = 'America/Los_Angeles';

const { sequelize } = require('./models');
const users = require('./routes/api/users');
const slots = require('./routes/api/slots');

const { verifyTasks, scheduleRescheduleUsers } = require('./scheduler');

const app = express();
// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
app.use(expressPino);
// DB Config
// verify database
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await verifyTasks();
    await scheduleRescheduleUsers();
    pino.info('database initialized successfully!');

    var sess = {
      store: new (require('express-session-sequelize')(session.Store))({ db: sequelize }),
      secret: require('./config/keys').secret,
      cookie: {},
      secure: false,
      saveUninitialized: false,
      resave: false,
    };
    if (process.env.NODE_ENV === 'production') {
      app.set('trust proxy', 1);
      sess.cookie.secure = true;
    }
    app.use(session(sess));

    app.use('/api/users', users);
    app.use('/api/slots', slots);
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      pino.info(`Server up and running on port ${port} !`);
    });
  } catch (err) {
    pino.fatal('Database initialization error!');
    pino.fatal(err.stack);
    process.exit();
  }
})();
