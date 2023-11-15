const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OneToOneConversation",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
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
  status: {
    type: String,
    enum: ["Delivered", "Seen"],
  },
});

module.exports = mongoose.model("Message", schema);
