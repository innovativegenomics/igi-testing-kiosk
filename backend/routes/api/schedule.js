const express = require("express");
const router = express.Router();

const Cas = require('../../cas');

router.post('/get_next_available_appointment', Cas.block, (req, res) => {
    // for a given user, returns next day that user is scheduled for
    // should be in increments of 3 days
});

router.post('/get_time_slots', Cas.block, (req, res) => {
    // for a given day, verify user is scheduled for that day
    // if so, return open slots
});

router.post('/request_time_slot', Cas.block, (req, res) => {
    // for a given user, day, and timeslot, verify user can have that time
    // if time still available, return success
    // if user had previous time slot, open that up
    // if slot taken, return failure
});

router.post('/request_cancel_appointment', Cas.block, (req, res) => {
    // user request cancel appointment
    // if user had appointment, return success
    // if user didn't have appointment, fail
});

module.exports = router;
