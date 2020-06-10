const express = require("express");
const router = express.Router();
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const Cas = require('../../cas');
const { getUserExists, getUserProfile, setUserProfile, updateUserLastSignin, addLIMSPatient, setUserPatientID } = require('../../database/userActions');
const { newUserSlot } = require('../../database/scheduleActions');

const { scheduleSignupEmail } = require('../../scheduler');

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
            if(!require('../../config/keys').newusers) {
                console.log(`user with calnetid ${calnetid} not authorized`);
                request.session.destroy();
                response.status(401).send('Unauthorized user');
            } else {
                response.redirect('/newuser');
            }
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
            user: {
                firstname: user.firstname,
                middlename: user.middlename,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                admin: user.admin
            }
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
 *   county: string,
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
        if(success) {
            return newUserSlot(calnetid).then(r => {
                if(r) {
                    addLIMSPatient(request.body).then(patientid => {
                        return setUserPatientID(calnetid, patientid);
                    });
                    scheduleSignupEmail(request.body.email);
                }
                response.json({success: r});
            });
        } else {
            response.json({success: false});
        }
    }).catch(err => {
        console.error(err);
        response.json({success: false});
    });
});

/**
 * Callback URL for LIMs patient creation
 * 
 */
router.post('/lims', (request, response) => {
    console.log(request);
    response.status(200).send();
});

/**
 * Quick and dirty way for the frontend to know if the server is dev mode
 */
router.post('/get/devmode', (request, response) => {
    response.json({devmode: (process.env.NODE_ENV !== 'production')});
});

module.exports = router;
