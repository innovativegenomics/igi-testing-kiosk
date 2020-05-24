const express = require("express");
const session = require('express-session');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const CASAuthentication = require('cas-authentication');

const UserRoutes = require('./routes/api/users');
const scheduler = require('./routes/api/scheduler');


const app = express();

var casOptions = {
    cas_url         : 'https://auth-test.berkeley.edu/cas',
    service_url     : 'https://kiosk.andycate.com',
    cas_version     : '3.0',
    renew           : false,
    is_dev_mode     : true,
    dev_mode_user   : 'andycate',
    dev_mode_info   : {},
    session_name    : 'cas_user',
    session_info    : 'cas_userinfo',
    destroy_session : false
};
var sess = {
    secret: require('./config/keys').secretKey,
    cookie: {},
    secure: false,
};
if(app.get('env') === 'production') {
    casOptions.is_dev_mode = false;
    casOptions.cas_url = 'https://auth.berkeley.edu/cas'

    app.set('trust proxy', 1);
    sess.cookie.secure = true;
}
var cas = new CASAuthentication(casOptions);
app.use(session(sess));

// Bodyparser middleware
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());
// DB Config
const db = require("./config/keys").mongoURI;
// Connect to MongoDB
mongoose
    .connect(
        db,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));

const userRoutes = new UserRoutes(cas);
app.use("/api/users", userRoutes.router);
app.use("/api/schedule", scheduler);

const port = process.env.PORT || 5000; // process.env.port is Heroku's port if you choose to deploy the app there
app.listen(port, () => console.log(`Server up and running on port ${port} !`));
