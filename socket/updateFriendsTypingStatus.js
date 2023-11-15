const OneToOneConversation = require("../models/oneToOneConversation");

module.exports = (socket, t) => {
  socket.on("start_typing", async ({ conversatoin_id, user_id }) => {
    const conversation = await OneToOneConversation.findById(conversatoin_id);
    if (!conversation)
      return socket.emit("error", {
        message: "This conversation dos not exist",
      });
    conversation.users.forEach((id) => {
      if (id.toString() === user_id) return;
      socket
        .to(id.toString())
        .emit("typing", {
          conversation: conversation._id,
          typing_status: true,
        });
    });
  });
  socket.on("stop_typing", async ({ conversatoin_id, user_id }) => {
    const conversation = await OneToOneConversation.findById(conversatoin_id);
    if (!conversation)
      return socket.emit("error", {
        message: "This conversation dos not exist",
      });
    conversation.users.forEach((id) => {
      if (id.toString() === user_id) return;
      socket
        .to(id.toString())
        .emit("typing", {
          conversation: conversation._id,
          typing_status: false,
        });
    });
  });
};
