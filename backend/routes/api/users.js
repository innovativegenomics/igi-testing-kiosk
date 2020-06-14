const express = require('express');
const router = express.Router();
const pino = require('pino')({level: process.env.LOG_LEVEL || 'info'});
const moment = require('moment');
const short = require('short-uuid');

const { sequelize, User, Slot, Settings } = require('../../models');
const { newPatient } = require('../../lims');
const cas = require('../../cas');
const { scheduleSignupEmail } = require('../../scheduler');

/**
 * Logs in existing and new users
 * If the users already exists, it directs them to the dashboard.
 * If the user is new, it directs them to the new user page.
 */
router.get('/login', cas.bounce, (request, response) => {
    const calnetid = request.session.cas_user;
    return sequelize.transaction(t => {
        return User.findOne({where: {calnetid: calnetid}, transaction: t}).then(user => {
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
});

/**
 * Logs out users
 */
router.get('/logout', cas.logout);

/**
 * Returns selected profile information for a given user
 * request format: {}
 * response format:
 * {
 *   success: true,
 *   user: {
 *     firstname: string,
 *     middlename: string|null,
 *     lastname: string,
 *     email: string,
 *     phone: string|null,
 *   }
 * }
 */
router.get('/profile', cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    pino.debug(`trying to get profile for user ${calnetid}`);
    return User.findOne({attributes: ['firstname', 'middlename', 'lastname', 'email', 'phone'], where: {calnetid: calnetid}}).then(profile => {
        if(profile) {
            response.send({success: true, user: profile});
        } else {
            response.send({success: false, user: {}});
        }
    });
});

/**
 * Sets all the profile information for a user
 * request format:
 * {
 *   firstname: string,
 *   middlename: string|null,
 *   lastname: string,
 *   dob: string,
 *   street: string,
 *   city: string,
 *   state: string,
 *   county: string,
 *   zip: string,
 *   sex: string,
 *   pbuilding: string,
 *   email: string,
 *   phone: string|null,
 * }
 * response format:
 * {success: true|false}
 */
router.post('/profile', cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    return sequelize.transaction(t => {
        return User.count({where: {calnetid: calnetid}, transaction: t}).then(c => {
            if(c > 0) {
                response.send({success: false, error: 'USER_EXISTS'});
            } else {
                return User.create({
                    firstname: request.body.firstname,
                    middlename: request.body.middlename,
                    lastname: request.body.lastname,
                    calnetid: calnetid,
                    dob: moment.utc(request.body.dob).format('YYYY-MM-DD'),
                    street: request.body.street,
                    city: request.body.city,
                    state: request.body.state,
                    county: request.body.county,
                    zip: request.body.zip,
                    sex: request.body.sex,
                    pbuilding: request.body.pbuilding,
                    email: request.body.email,
                    phone: request.body.phone,
                    questions: request.body.questions,
                }, {transaction: t}).then(user => {
                    return Slot.create({calnetid: calnetid,
                                        time: moment().startOf('week').toDate(),
                                        uid: short().new()}, {transaction: t}).then(slot => {
                        scheduleSignupEmail(request.body.email).catch(err => {
                            pino.error(`Coundn't schedule signup email for user ${calnetid}`);
                            pino.error(err);
                        });
                        response.send({success: true});
                    });
                }).then(r => {
                    return Settings.findOne({transaction: t});
                }).then(settings => {
                    return newPatient(request.body, settings.accesstoken, settings.refreshtoken).then(res=> {
                        if(res.accesstoken) {
                            settings.accesstoken = res.accesstoken;
                            return settings.save();
                        }
                    }).catch(err => {
                        pino.error('Can not add new LIMs patient');
                        pino.error(err);
                        return true;
                    });
                });
            }
        });
    });
});

/**
 * Quick and dirty way for the frontend to know if the server is dev mode
 */
router.get('/devmode', (request, response) => {
    response.json({devmode: (process.env.NODE_ENV !== 'production')});
});

module.exports = router;
