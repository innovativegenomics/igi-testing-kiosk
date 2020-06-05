const express = require("express");
const router = express.Router();
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const Cas = require('../../cas');
const { getUserExists, getUserProfile, setUserProfile, updateUserLastSignin } = require('../../database/userActions');

/**
 * Logs in existing and new users
 * If the users already exists, it directs them to the dashboard.
 * If the user is new, it directs them to the new user page.
 */
router.get('/login', Cas.bounce, (request, response) => {
    const calnetid = request.session.cas_user;
    getUserExists(calnetid).then(exists => {
        if(exists) {
            return updateUserLastSignin(calnetid).then(r => {
                response.redirect('/dashboard');
            });
        } else {
            response.redirect('/newuser');
        }
    });
});

/**
 * Logs out users
 */
router.get('/logout', Cas.logout);

/**
 * Returns selected profile information for a given user
 * request format: {}
 * response format:
 * {
 *   success: true,
 *   firstname: string,
 *   middlename: string,
 *   lastname: string,
 *   email: string,
 *   phone: string,
 *   admin: Number
 * }
 */
router.post('/get/profile', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    getUserProfile(calnetid).then(user => {
        response.json({
            success: true,
            firstname: user.firstname,
            middlename: user.middlename,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone,
            admin: user.admin
        });
    }).catch(err => {
        response.json({success: false});
    });
});

/**
 * Sets all the profile information for a user
 * request format:
 * {
 *   firstname: string,
 *   middlename: string,
 *   lastname: string,
 *   dob: moment,
 *   street: string,
 *   city: string,
 *   state: string,
 *   country: string,
 *   zip: string,
 *   sex: string,
 *   race: string,
 *   pbuilding: string,
 *   email: string,
 *   phone: string,
 * }
 * response format:
 * {success: true|false}
 */
router.post('/set/profile', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    setUserProfile(calnetid, request.body).then(success => {
        response.json({success: success});
    });
});

/**
 * Quick and dirty way for the frontend to know if the server is dev mode
 */
router.post('/get/devmode', (request, response) => {
    response.json({devmode: (process.env.NODE_ENV !== 'production')});
});

module.exports = router;
