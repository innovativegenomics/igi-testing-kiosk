const express = require("express");
const router = express.Router();
const moment = require('moment');
const short = require('short-uuid');

const Cas = require('../../cas');
const { Settings } = require('../../database/settingsActions');

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
});

/**
 * Assigns the user a slot, and triggers an email and text confirmation
 * request body format: {slot: moment.Moment, location: string}
 * response body format: {success: true|false, error: ["TAKEN", "NOT_VALID"]}
 */
router.post('/set/slot', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
});

/**
 * Cancels a user's appointment
 * request body: {}
 * response body:
 * {success: true}
 * {success: false}
 */
router.post('/get/cancel', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
});

module.exports = router;
