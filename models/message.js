const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  converstation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OneToOneConversation",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reciver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["Text", "Image", "Video", "Link", "Doc", "Voice", "Replay"],
    required: true,
  },
  replay: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
  text: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  edited: {
    type: Boolean,
    default: false,
  },
  file: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
});

module.exports = mongoose.model("Message", schema);
