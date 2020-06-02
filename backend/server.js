const path = require('path');
const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const pg = require('pg');

process.env.TZ = 'America/Los_Angeles';
const { verifyTables } = require('./database/database');

const users = require('./routes/api/users');
const schedule = require('./routes/api/schedule');

const { startScheduler } = require('./scheduler');

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
    
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        startScheduler();
        console.log(`Server up and running on port ${port} !`);
    });
}).catch(err => {
    console.error('Database initialization error!');
    console.error(err.stack);
    process.exit();
});
