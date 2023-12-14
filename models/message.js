const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
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
    replay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    text: {
      type: String,
    },
    files: {
      type: mongoose.Schema.Types.Array,
      required: false,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "Delivered",
      enum: ["Delivered", "Seen"],
    },
    createdAt_day: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", schema);
