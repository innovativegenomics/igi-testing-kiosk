const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");

if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config({path: path.resolve(process.cwd(), '.env.dev')});
}
const { verifyTables } = require('./database');

const users = require('./routes/api/users');
const scheduler = require('./routes/api/scheduler');


const app = express();

var sess = {
    secret: require('./config/keys').secretKey,
    cookie: {},
    secure: false,
};
if(process.env.PRODUCTION === 'true') {
    app.set('trust proxy', 1);
    sess.cookie.secure = true;
}
app.use(session(sess));

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
}).catch(err => {
    console.log('Database initialization error!');
    process.exit();
});

app.use("/api/users", users);
app.use("/api/scheduler", scheduler);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server up and running on port ${port} !`));
