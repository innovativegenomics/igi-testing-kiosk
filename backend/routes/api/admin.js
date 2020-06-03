const express = require("express");
const router = express.Router();

const Cas = require('../../cas');

const { getUserAdmin } = require('../../database/userActions');
const { getSlotInfo, finishAppointment } = require('../../database/adminActions');

router.post('/get_slot_info', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    getUserAdmin(calnetid).then(res => {
        if(res > 0) {
            return true;
        } else {
            response.status(401).send('not authorized');
            return false;
        }
    }).then(res => {
        if(res) {
            return getSlotInfo(request.body.uid).then(r => {
                response.json(r);
            });
        }
    }).catch(err => {
        response.status(500).send('error');
    });
});

router.post('/finish_appointment', Cas.block, (request, response) => {
    const calnetid = request.session.cas_user;
    getUserAdmin(calnetid).then(res => {
        if(res > 1) {
            return true;
        } else {
            response.status(401).send('not authorized');
            return false;
        }
    }).then(res => {
        if(res) {
            return finishAppointment(request.body.uid).then(r => {
                if(r) {
                    response.json({});
                } else {
                    response.status(400).send('no appointment with that uid');
                }
            });
        }
    }).catch(err => {
        response.status(500).send('error');
    });
});

module.exports = router;
