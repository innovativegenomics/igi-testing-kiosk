const path = require('path');
const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const pg = require('pg');

process.env.TZ = 'America/Los_Angeles';
process.env.PGUSER = require('./config/keys').pg.pguser;
process.env.PGHOST = require('./config/keys').pg.pghost;
process.env.PGPASSWORD = require('./config/keys').pg.pgpassword;
process.env.PGDATABASE = require('./config/keys').pg.pgdatabase;
process.env.PGPORT = require('./config/keys').pg.pgport;
const { verifyTables } = require('./database/database');

const users = require('./routes/api/users');
// const schedule = require('./routes/api/schedule');
// const admin = require('./routes/api/admin');

const { verifyScheduler, setUpdateSchedulesTask } = require('./scheduler');

const app = express();
// Bodyparser middleware
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());
// DB Config
// verify database
verifyTables().then(res => {
    return verifyScheduler().then(r => setUpdateSchedulesTask());
}).then(res => {
    console.log('database initialized successfully!');
    // register services that rely on the database
    var sess = {
        store: new (require('connect-pg-simple')(session))({pool: new pg.Pool()}),
        secret: require('./config/keys').secretKey,
        cookie: {},
        secure: false,
        saveUninitialized: false,
        resave: false,
    };
    if(process.env.PRODUCTION === 'true') {
        app.set('trust proxy', 1);
        sess.cookie.secure = true;
    }
    app.use(session(sess));
    
    app.use("/api/users", users);
    app.use("/api/schedule", schedule);
    app.use("/api/admin", admin);
    
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Server up and running on port ${port} !`);
    });
}).catch(err => {
    console.error('Database initialization error!');
    console.error(err.stack);
    process.exit();
});
