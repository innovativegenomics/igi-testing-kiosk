const express = require("express");
const router = express.Router();
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const Cas = require('../../cas');
const { containsUser,
        insertUser,
        updateLastUserSignin,
        checkAllUserInfoPresent,
        getUserByID,
        updateFirstName,
        updateLastName,
        updateEmail,
        updatePhone,
        updateAlertEmail,
        updateAlertPhone } = require('../../database/userActions');
const { insertScreening } = require('../../database/screeningActions');

router.get('/login', Cas.bounce, (request, response) => {
    const calnetid = request.session.cas_user;
    return containsUser(calnetid).then(res => {
        if(!res) {
            // insert new user
            return insertUser(calnetid).then(res => {
                response.redirect('/newuser');
            }).catch(err => {
                console.error(`Error inserting new user ${calnetid}`);
                console.error(err.stack);
                response.status(500);
                return err;
            });
        } else {
            // update last signin
            return updateLastUserSignin(calnetid).then(res => {
                // redirect to dashboard
                return checkAllUserInfoPresent(calnetid);
            }).then(res => {
                if(res) {
                    response.redirect('/dashboard');
                } else {
                    response.redirect('/newuser');
                }
            }).catch(err => {
                console.error(`Error updating last signin date for user ${calnetid}`);
                console.error(err.stack);
                response.status(500);
                return err;
            });
        }
    }).catch(err => {
        console.error(`error checking if user ${calnetid} exists!`);
        console.error(err.stack);
        response.status(500);
    });
});

router.get('/logout', Cas.logout);

router.get('/get/profile', Cas.block, (request, response) => {
    // returns a single row from the database
    const calnetid = request.session.cas_user;
    getUserByID(calnetid).then(res => {
        response.json(res);
    }).catch(err => {
        response.status(500);
    });
});

// sets any of the following parameters:
// - first or last name
// - email
// - phone
// - alertemail
// - alertphone
router.post('/set/firstname', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    if(!request.body.firstname) {
        return response.status(400).json({error: 'No firstname parameter'});
    }
    updateFirstName(calnetid, request.body.firstname).then(res => {
        if(res) {
            return response.status(200).json({});
        }
        return response.status(500);
    }).catch(err => {
        console.error(`Error setting firstname for ${calnetid}`);
        console.error(err.stack);
    });
});
router.post('/set/lastname', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    if(!request.body.lastname) {
        return response.status(400).json({error: 'No lastname parameter'});
    }
    updateLastName(calnetid, request.body.lastname).then(res => {
        if(res) {
            return response.status(200).json({});
        }
        return response.status(500);
    }).catch(err => {
        console.error(`Error setting lastname for ${calnetid}`);
        console.error(err.stack);
    });
});
router.post('/set/email', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    if(!request.body.email) {
        return response.status(400).json({error: 'No email parameter'});
    }
    if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(request.body.email)) {
        return response.status(400).json({error: 'Email invalid'});
    }
    updateEmail(calnetid, request.body.email).then(res => {
        if(res) {
            return response.status(200).json({});
        }
        return response.status(500);
    }).catch(err => {
        console.error(`Error setting email for ${calnetid}`);
        console.error(err.stack);
    });
});
router.post('/set/phone', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    if(!request.body.phone) {
        return response.status(400).json({error: 'No phone parameter'});
    }
    const phone = phoneUtil.parse(request.body.phone, 'US');
    if(!phoneUtil.isValidNumber(phone)) {
        return response.status(400).json({error: 'invalid phone number'});
    }
    updatePhone(calnetid, phoneUtil.format(phone, PNF.E164)).then(res => {
        if(res) {
            return response.status(200).json({});
        }
        return response.status(500);
    }).catch(err => {
        console.error(`Error setting phone for ${calnetid}`);
        console.error(err.stack);
    });
});
router.post('/set/alertemail', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    if(typeof request.body.alertemail !== 'boolean') {
        return response.status(400).json({error: 'No alertemail parameter'});
    }
    updateAlertEmail(calnetid, request.body.alertemail).then(res => {
        if(res) {
            return response.status(200).json({});
        }
        return response.status(500);
    }).catch(err => {
        console.error(`Error setting alertemail for ${calnetid}`);
        console.error(err.stack);
    });
});
router.post('/set/alertphone', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    if(typeof request.body.alertphone !== 'boolean') {
        return response.status(400).json({error: 'No alertphone parameter'});
    }
    updateAlertPhone(calnetid, request.body.alertphone).then(res => {
        if(res) {
            return response.status(200).json({});
        }
        return response.status(500);
    }).catch(err => {
        console.error(`Error setting alertphone for ${calnetid}`);
        console.error(err.stack);
        return response.status(500);
    });
});
router.post('/submit_screening', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    insertScreening(calnetid, request.body).then(res => {
        if(res) {
            response.json({});
        } else {
            response.status(400).json({error: 'could not insert screening'});
        }
    }).catch(err => {
        response.status(500);
    });
});

module.exports = router;
