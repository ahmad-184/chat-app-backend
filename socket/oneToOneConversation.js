const User = require("../models/user");
const OneToOneConversation = require("../models/oneToOneConversation");
const Message = require("../models/message");

module.exports = (socket, t) => {
  // send message

  socket.on("start_conversation", async ({ friend_id, user_id }, callback) => {
    const isConversationExists = await OneToOneConversation.find({
      $and: [
        {
          users: {
            $elemMatch: {
              $eq: user_id,
            },
          },
        },
        {
          users: {
            $elemMatch: {
              $eq: friend_id,
            },
          },
        },
      ],
    });
    const friendDoc = await User.findById(friend_id);

    let data = {
      friend_id: friendDoc._id,
      name: `${friendDoc.firstname} ${friendDoc.lastname}`,
      avatar: friendDoc.avatar,
      status: friendDoc.status,
      lastSeen: friendDoc.lastSeen || "",
      typing: false,
    };

    // convertion dos not exist. create conversation and sed it to user
    if (!Boolean(isConversationExists.length)) {
      const conversation = await OneToOneConversation.create({
        users: [friend_id, user_id],
      });
      const messages = await Message.find({
        conversation_id: conversation._id,
      });

      const unseenMessagesCount = await Message.find({
        conversation_id: conversation._id,
        status: "Delivered",
      }).countDocuments();

      data = {
        _id: conversation._id,
        ...data,
        last_message: messages[messages.length - 1] || {},
        unseen: unseenMessagesCount || 0,
      };

      callback({
        conversation: data,
        messages,
      });
    } else {
      const messages = await Message.find({
        conversation_id: isConversationExists[0]._id,
      });
      const unseenMessagesCount = await Message.find({
        conversation_id: isConversationExists[0]._id,
        status: "Delivered",
      });

      data = {
        _id: isConversationExists[0]._id,
        ...data,
        last_message: messages[messages.length - 1] || {},
        unseen: unseenMessagesCount || 0,
      };

      callback({
        conversation: data,
        messages,
      });
    }
  });

  socket.on("join_a_chat_conversation", async ({ room_id }, callback) => {
    if (!room_id)
      return socket.emit("error", {
        message: "Room id is required",
      });

    const isConversationExists = await OneToOneConversation.findById(room_id);
    if (!Boolean(isConversationExists))
      return socket.emit("error", {
        message: "This conversation not exist",
      });

    await socket.join(room_id);

    callback({ message: "Joined room" });
  });

  socket.on("leave_chat_conversation", async ({ room_id }, callback) => {
    if (!room_id)
      return socket.emit("error", {
        message: "Room id is required",
      });

    await socket.leave(room_id);

    callback({ message: "Leaved room" });
  });

  socket.on("send_message", async ({ message, room_id, user_id }, callback) => {
    const conversation = await OneToOneConversation.findById(room_id);
    if (!conversation)
      return socket.emit("error", {
        message: "This conversation dos not exist",
      });

    let msg;
    const newMsg = message;
    newMsg.status = "Delivered";

    if (!message.file) {
      msg = await Message.create({
        ...newMsg,
      });
    }

    Promise.all([
      conversation.users.forEach((id) => {
        if (id.toString() === user_id) return;
        else socket.to(id.toString()).emit("new_message", { message: msg });
      }),
    ]).then(() => callback({ message: msg }));
  });
};
