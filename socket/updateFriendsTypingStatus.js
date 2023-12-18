const OneToOneConversation = require("../models/oneToOneConversation");

module.exports = (socket, t) => {
  socket.on(
    "update_typing_status",
    async ({ conversatoin_id, user_id, typing_status }) => {
      try {
        const conversation = await OneToOneConversation.findById(
          conversatoin_id
        );
        if (!conversation)
          return socket.emit("error", {
            message: "This conversation dos not exist",
            code: "CONV_NOT_EXIST",
            conv_id: conversatoin_id,
          });
        conversation.users.forEach((id) => {
          if (id.toString() === user_id) return;
          socket.to(id.toString()).emit("typing", {
            conversation_id: conversation._id,
            typing_status,
          });
          console.log(conversatoin_id, user_id, typing_status);
        });
      } catch (err) {
        console.log(err);
        return socket.emit("error", {
          message: err.message,
        });
      }
    }
  );
};
