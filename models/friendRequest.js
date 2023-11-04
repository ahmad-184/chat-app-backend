const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    default: "waiting",
    enum: ['Accepted', "Rejected", "waiting"]
  }
});

module.exports = mongoose.model("FriendRequest", schema);
