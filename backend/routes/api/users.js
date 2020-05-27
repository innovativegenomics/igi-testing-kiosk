const express = require("express");
const router = express.Router();

const Cas = require('../../cas');
const { containsUser, insertUser, updateLastUserSignin, checkAllUserInfoPresent } = require('../../database');

router.get('/login', Cas.bounce, (request, response) => {
    const calnetID = request.session.cas_user;
    return containsUser(calnetID).then(res => {
        if(!res) {
            // insert new user
            return insertUser(calnetID).then(res => {
                response.redirect('/newuser');
            }).catch(err => {
                console.error(`Error inserting new user ${calnetID}`);
                console.error(err.stack);
                response.status(500);
                return err;
            });
        } else {
            // update last signin
            return updateLastUserSignin(calnetID).then(res => {
                // redirect to dashboard
                return checkAllUserInfoPresent(calnetID);
            }).then(res => {
                if(res) {
                    response.redirect('/dashboard');
                } else {
                    response.redirect('/newuser');
                }
            }).catch(err => {
                console.error(`Error updating last signin date for user ${calnetID}`);
                console.error(err.stack);
                response.status(500);
                return err;
            });
        }
    }).catch(err => {
        console.error(`error checking if user ${calnetID} exists!`);
        console.error(err.stack);
        response.status(500);
    });
});

router.get('/logout', Cas.logout);

router.get('/get_user_profile', Cas.block, (request, response) => {
});

router.post('/set_user_profile', Cas.block, (request, response) => {
});

module.exports = router;
