const express = require("express");
const router = express.Router();
const moment = require('moment');
// const short = require('short-uuid');

const Cas = require('../../cas');
// const { Settings } = require('../../database/settingsActions');
const { getUserSlot, getAvailableSlots, setUserSlot, cancelSlot } = require('../../database/scheduleActions');

/**
 * Returns the user's currently assigned slot
 * request body format: {}
 * response body format:
 * {success: true, scheduled: true, slot: moment.Moment, location: string}
 * {success: true, scheduled: false, slot: moment.Moment}
 * {success: false}
 */
router.post('/get/slot', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    getUserSlot(calnetid).then(res => {
        response.json({...res, success: true});
    }).catch(err => {
        response.json({success: false});
    });
});

/**
 * Returns the availability for the given user
 * request body format: {}
 * response body format:
 * {success: true, {locationname: [moment.Moment, moment.Moment, ...]}}
 * {success: false}
 */
router.post('/get/available', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    getAvailableSlots(calnetid).then(res => {
        response.json({success: true, open: res});
    }).catch(err => {
        response.json({success: false});
    });
});

/**
 * Assigns the user a slot, and triggers an email and text confirmation
 * request body format: {slot: moment.Moment, location: string}
 * response body format: {success: true|false, error: ["TAKEN", "NOT_VALID"]}
 */
router.post('/set/slot', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    setUserSlot(calnetid, moment(request.body.slot), request.body.location).then(res => {
        response.json({success: true});
    }).catch(err => {
        response.json({success: false});
    });
});

/**
 * Cancels a user's appointment
 * request body: {}
 * response body:
 * {success: true}
 * {success: false}
 */
router.post('/set/cancel', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    cancelSlot(calnetid).then(res => {
        response.send({success: res});
    });
});

module.exports = router;
