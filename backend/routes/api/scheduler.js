const express = require("express");
const router = express.Router();

const User = require("../../models/User");

router.post('/get_month_appointments', (req, res) => {
    if(!req.body.month) {
        return res.status(400).json({error: 'Month not specified!'});
    } else if(!req.body.year) {
        return res.status(400).json({error: 'Year not specified!'});
    }
    User.find({appointments: {current: {year: req.body.year, month: req.body.month}}}, (err, docs) => {
        var slots = {};
        for(var i in docs) {
            let day = docs[i].appointments.current.day;
            if(day in slots) {
                slots[day] = slots[day] + 1;
            }
        }
    });
});

module.exports = router;
