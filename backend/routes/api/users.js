const express = require('express');
const router = express.Router();
const pino = require('pino')();
const moment = require('moment');

const { User } = require('../../models');
const cas = require('../../cas');

router.get('/login', cas.bounce, (request, response) => {
    const calnetid = request.session.cas_user;
    return User.findOne({where: {calnetid: calnetid}}).then(user => {
        if(user) {
            user.lastlogin = moment().toDate();
            return user.save().then(res => {
                response.redirect('/dashboard');
            });
        } else {
            if(!require('../../config/keys').newusers) {
                pino.error(`user with calnetid ${calnetid} not authorized`);
                request.session.destroy();
                response.status(401).send('Unauthorized user');
            } else {
                response.redirect('/newuser');
            }
        }
    });
});

module.exports = router;
