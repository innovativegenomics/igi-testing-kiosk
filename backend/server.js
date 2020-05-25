const express = require("express");
const session = require('express-session');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const users = require('./routes/api/users');
const scheduler = require('./routes/api/scheduler');


const app = express();

var sess = {
    secret: require('./config/keys').secretKey,
    cookie: {},
    secure: false,
};
if(process.env.PRODUCTION === 'true') {
    // app.set('trust proxy', 1);
    // sess.cookie.secure = true;
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
const db = require("./config/keys").mongoURI;
// Connect to MongoDB
mongoose
    .connect(
        db,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));

app.use("/api/users", users);
app.use("/api/scheduler", scheduler);

const port = process.env.PORT || 5000; // process.env.port is Heroku's port if you choose to deploy the app there
app.listen(port, () => console.log(`Server up and running on port ${port} !`));
