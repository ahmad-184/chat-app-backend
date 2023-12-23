const User = require("../models/user");
const Conversations = require("../models/conversation");
const Message = require("../models/message");

module.exports = (socket, t) => {
  socket.on("send_message", async ({ message_id, room_id, user_id }) => {
    try {
      const conversation = await Conversations.findById(room_id);
      if (!conversation)
        return socket.emit("error", {
          message: "This conversation dos not exist",
          code: "CONV_NOT_EXIST",
          conv_id: room_id,
        });

      const message = await Message.findById(message_id);

      Promise.all([
        conversation.users.forEach((id) => {
          if (id.toString() === user_id) return;
          else socket.to(id.toString()).emit("new_message", { message });
        }),
      ]);
    } catch (err) {
      console.log(err);
      return socket.emit("error", {
        message: err.message,
      });
    }
  });

  socket.on("delete_message", async ({ message_id, user_id }) => {
    try {
      const message = await Message.findById(message_id);
      if (!message)
        return socket.emit("error", {
          message: "This message does not exist",
          code: "CONV_NOT_EXIST",
          conv_id: room_id,
        });

      socket.to(user_id).emit("delete_message", {
        message_id,
        conv_id: message.conversation_id,
      });
    } catch (err) {
      console.log(err);
      return socket.emit("error", {
        message: err.message,
      });
    }
  });
};
