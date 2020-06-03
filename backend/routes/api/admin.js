const express = require("express");
const router = express.Router();

const Cas = require('../../cas');

const { getUserAdmin } = require('../../database/userActions');
const { getSlotInfo } = require('../../database/adminActions');

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
            console.log(request.body);
            return getSlotInfo(request.body.uid).then(r => {
                response.json(r);
            });
        } else {
            return false;
        }
    }).catch(err => {
        response.status(500).send('error');
    });
});

module.exports = router;
