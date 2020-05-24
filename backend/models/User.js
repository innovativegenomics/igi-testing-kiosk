const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const UserSchema = new Schema({
    firstName: {
        type: String,
        default: '',
    },
    middleName: {
        type: String,
        default: '',
    },
    lastName: {
        type: String,
        default: '',
    },
    calnetID: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        default: '',
    },
    phone: {
        type: Number,
        default: 0
    },
    dateOfBirth: {
        type: Date,
        default: Date.now,
    },
    dateJoined: {
        type: Date,
        default: Date.now
    },
    queueNumber: {
        type: Number,
        required: true,
    },
    lastSignIn: {
        type: Date,
        default: Date.now
    },
    activeTesting: {
        type: Boolean,
        default: true,
    },
    admin: {
        type: Boolean,
        default: false
    },
    appointments: {
        next: {
            location: Number,
            slot: {
                year: Number,
                month: Number,
                day: Number,
                time: {
                    hour: Number,
                    minute: Number
                },
            }
        },
        previous: [{ location: Number, slot: { year: Number, month: Number, day: Number, time: { hour: Number, minute: Number } }, completed: Boolean }],
    },
});
module.exports = User = mongoose.model("users", UserSchema);
