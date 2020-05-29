const express = require("express");
const router = express.Router();
const moment = require('moment');
const short = require('short-uuid');

const Cas = require('../../cas');
const { Settings } = require('../../database/settingsActions');
const { getOpenSlots, userAssignedDay, assignSlot, cancelSlot } = require('../../database/scheduleActions');
const { getUserByID } = require('../../database/userActions');
const { sendConfirmEmail, sendConfirmText } = require('../../messager');

router.post('/get_time_slots', Cas.block, (request, response) => {
    // for a given day, verify user is scheduled for that day
    // if so, return open slots
    const calnetid = request.session.cas_user;
    const requestMoment = moment(request.body.moment);
    if(!requestMoment.isValid()) {
        response.status(400).json({error: 'no valid moment provided'});
        return;
    }
    userAssignedDay(calnetid, requestMoment.year(), requestMoment.month(), requestMoment.day()).then(res => {
        if(res) {
            return getOpenSlots(requestMoment.year(), requestMoment.month(), requestMoment.day()).then(res => {
                response.json(res);
            });
        } else {
            response.status(400).json({error: 'user not authorized to view status for this day'});
        }
    }).catch(err => {
        console.error('Error checking if user assigned day');
        console.error(err.stack);
        response.status(500);
    });
});

router.post('/request_time_slot', Cas.block, (request, response) => {
    // for a given user, day, and timeslot, verify user can have that time
    // if time still available, return success
    // if user had previous time slot, open that up
    // if slot taken, return failure
    const calnetid = request.session.cas_user;
    const requestMoment = moment(request.body.moment);
    if(!requestMoment.isValid()) {
        response.status(400).json({error: 'no valid moment provided'});
        return;
    }
    if(!request.body.location) {
        response.status(400).json({error: 'no valid location provided'});
        return;
    }
    const uid = short('0123456789').new();
    assignSlot(calnetid, request.body.location, requestMoment.year(), requestMoment.month(), requestMoment.day(), requestMoment.hour(), requestMoment.minute(), uid).then(res => {
        if(res) {
            // send messages
            return getUserByID(calnetid).then(res => {
                response.json({uid: uid});
                if(res.alertemail) {
                    sendConfirmEmail(res.email, uid, requestMoment.format('dddd, MMMM DD'),
                                                        requestMoment.format('h:mmA'),
                                                        requestMoment.clone().add(Settings().increment, 'minute').format('h:mmA'),
                                                        request.body.location,
                                                        Settings().locationlinks[request.body.location]).catch(err => {
                        console.error(`failed sending confirmation email to ${calnetid}`);
                    });
                }
                if(res.alertphone && res.phone) {
                    sendConfirmText(res.phone, requestMoment.format('dddd, MMMM DD'),
                                                requestMoment.format('h:mmA'),
                                                requestMoment.clone().add(Settings().increment, 'minute').format('h:mmA'),
                                                request.body.location,
                                                Settings().locationlinks[request.body.location]).catch(err => {
                        console.error(`failed sending confirmation text to ${calnetid}`);
                        console.error(err.stack);
                    });
                }
            });
        } else {
            response.status(400).json({error: 'couldnt assign slot'});
        }
    }).catch(err => {
        console.error(err.stack);
        response.status(500);
    });
});

router.post('/request_cancel_appointment', Cas.block, (request, response) => {
    // user request cancel appointment
    // if user had appointment, return success
    // if user didn't have appointment, fail
    const calnetid = request.session.cas_user;
    cancelSlot(calnetid).then(res => {
        if(res) {
            response.json({});
        } else {
            response.status(400).json({error: 'couldn\'t cancel appointment'});
        }
    }).catch(err => {
        console.error(err.stack);
        response.status(500);
    });
});

module.exports = router;
