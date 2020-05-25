const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const SettingsSchema = new Schema({
    dayQuota: {
        type: Number,
        default: 100,
    },
    locations: [{name: String, map: String}],
    collectionTimeWindow: {
        startTime: {
            type: Number,
            default: 800, // 8 AM
        },
        endTime: {
            type: Number,
            default: 1300 // 1 PM
        },
        increment: {
            type: Number,
            default: 10 // minutes
        }
    }
});
module.exports = Settings = mongoose.model("settings", SettingsSchema);
