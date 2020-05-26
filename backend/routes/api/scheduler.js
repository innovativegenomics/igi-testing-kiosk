const express = require("express");
const router = express.Router();

const Cas = require('../../cas');

// router.post('/get_month_appointments', (req, res) => {
//     if(!req.body.month) {
//         return res.status(400).json({error: 'Month not specified!'});
//     } else if(!req.body.year) {
//         return res.status(400).json({error: 'Year not specified!'});
//     }
//     User.find({appointments: {current: {year: req.body.year, month: req.body.month}}}, (err, docs) => {
//         var slots = {};
//         for(var i in docs) {
//             let day = docs[i].appointments.current.day;
//             if(day in slots) {
//                 slots[day] = slots[day] + 1;
//             }
//         }
//     });
// });
router.post('/get_next_available_appointment', Cas.block, (req, res) => {

});

router.post('/get_time_slots', Cas.block, (req, res) => {

});

router.post('/request_time_slot', Cas.block, (req, res) => {

});

router.post('/request_cancel_appointment', Cas.block, (req, res) => {

});

module.exports = router;
