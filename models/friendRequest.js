const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'sender id is required']
  },
  reciver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'recipient id is required']
  },
  status: {
    type: String,
    default: "waiting",
    enum: ["Accepted", "Rejected", "waiting"],
  },
});

module.exports = mongoose.model("FriendRequest", schema);
