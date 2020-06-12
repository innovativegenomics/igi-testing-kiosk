const express = require("express");
const router = express.Router();
const moment = require('moment');

const Cas = require('../../cas');

const { Settings } = require('../../database/settingsActions');

const { getUserProfile } = require('../../database/userActions');
const { getUserAdmin, getSlotDetails, completeUserSlot } = require('../../database/adminActions');

/**
 * Returns the slot details for a given UID
 */
router.post('/get/slot', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    getUserAdmin(calnetid).then(level => {
        if(level > 0) {
            return getSlotDetails(request.body.uid).then(slot => {
                return getUserProfile(slot.calnetid).then(user => {
                    const errors = [];
                    var complete = true;
                    if(slot.completed || slot.rejected) {
                        errors.push('COMPLETED');
                        complete = false;
                    }
                    if(!slot.scheduled) {
                        errors.push('INACTIVE');
                        complete = false;
                    }
                    if(!moment().isBetween(moment(slot.slot), moment(slot.slot).add(Settings().increment, 'minute'))){
                        errors.push('WRONG_TIME');
                        if(errors[0] !== 'WRONG_TIME') {
                            complete = false;
                        }
                        if(!moment().isSame(moment(slot.slot), 'day')) {
                            complete = false;
                        }
                    }
                    if(complete && level > 1) {
                        return completeUserSlot(request.body.uid).then(res => response.send({success: true, completed: res, errors: errors, slot: {slot: slot.slot, location: slot.location, firstname: user.firstname, lastname: user.lastname}}));
                    } else {
                        response.send({success: true, completed: complete, errors: errors, slot: {slot: slot.slot, location: slot.location, firstname: user.firstname, lastname: user.lastname}});
                    }
                });
            }).catch(err => {
                console.error(err);
                response.send({success: true, errors: ['INVALID_UID']});
            });
        } else {
            response.send({success: false});
        }
    }).catch(err => {
        console.error('unable to get slot details ' + request.body.uid);
        response.send({success: false});
    });
});

router.post('/search/appointments', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    getUserAdmin(calnetid).then(level => {
        if(level > 0) {
            const terms = request.body.term.split(' ');
            return getAppointmentsByName(terms).then(res => {
                
            });
        } else {
            response.send({success: false});
        }
    }).catch(err => {
        console.error('unable to get slot details ' + request.body.uid);
        response.send({success: false});
    });
});

module.exports = router;
