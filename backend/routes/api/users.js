const express = require("express");
const url = require('url');

const User = require("../../models/User");

class UserRoutes {
    constructor(cas) {
        this.cas = cas;
        this.router = express.Router();
        this.router.get('/login', cas.bounce, this.loginRequest);
        this.router.post('/user_info', cas.block, this.userInfoRequest);
    }
    loginRequest = (req, res) => {
        console.log('login' + req.session);
        const calnetID = req.session.cas_user;
        User.findOne({calnetID: calnetID}, (err, doc) => {
            if(!doc) {
                // get the user's name from Cal LDAP
                const firstName = 'Andy';
                const lastName = 'Cate';
                const dob = new Date(2002, 10, 3);
                const email = 'and164v@gmail.com';
                const phone = 5106121014;
                User.countDocuments({}, (err, c) => {
                    const newUser = new User({
                        firstName: firstName,
                        lastName: lastName,
                        calnetID: calnetID,
                        queueNumber: c,
                        dateOfBirth: dob,
                        email: email,
                        phone: phone
                    });
                    newUser.save((err, docs) => {
                        if(!err) {
                            return res.redirect('/dashboard');
                        }
                        return res.status(500).send('could not createn new user');
                    });
                });
            } else {
                User.updateOne({calnetID: calnetID}, {lastSignIn: Date.now()}, (err, doc) => {
                    console.log('redirecting');
                    return res.redirect('/dashboard');
                });
            }
        });
    }
    userInfoRequest = (req, res) => {
        // get calnetID from session
        const calnetID = req.session.cas_user;
        // return user data
        console.log(req.session);
        User.findOne({calnetID: calnetID}, (err, doc) => {
            if(!doc) {
                return res.status(404).json({error: 'User not found!'});
            }
            return res.json(doc);
        });
    }
}

module.exports = UserRoutes;
