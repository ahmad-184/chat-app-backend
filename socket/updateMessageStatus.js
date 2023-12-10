const Message = require("../models/message");
const User = require("../models/user");

module.exports = async (socket, t) => {
  socket.on("update_message_status_to_Seen", async ({ message_id }) => {
    const message = await Message.findById(message_id);
    if (!message)
      return socket.emit("error", {
        message: "This message dosnt exist enymore",
        code: "CONV_NOT_EXIST",
      });
    if (message.status === "Seen") return;
    message.status = "Seen";
    await message.save({ new: true, validateModifiedOnly: true });

    const senderDoc = await User.findById(message.sender);
    socket.to(senderDoc._id.toString()).emit("message_status_changed", {
      message_id,
      conv_id: message.conversation_id,
    });
  });
};
