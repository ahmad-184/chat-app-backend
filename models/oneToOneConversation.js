const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  partisipants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("OneToOneConversation", schema);
