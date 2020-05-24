const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  sid: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  phone: {
    type: Number,
    required: false,
  },
  dateJoined: {
    type: Date,
    default: Date.now
  },
  appointments: {
    current: {
        location: Number,
        slot: Date,
    },
    previous: [{location: Number, slot: Date, completed: Boolean}],
  },
});
module.exports = User = mongoose.model("users", UserSchema);
