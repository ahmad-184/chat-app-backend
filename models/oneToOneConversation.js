const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    last_message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    // expireAt: {
    // type: Date,
    // default: Date.now() + 10000,
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OneToOneConversation", schema);
