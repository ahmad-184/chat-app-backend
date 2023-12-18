const User = require("../models/user");
const OneToOneConversation = require("../models/oneToOneConversation");
const Message = require("../models/message");

module.exports = (socket, t) => {
  // send message

  socket.on("start_conversation", async ({ friend_id, user_id }, callback) => {
    try {
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
        name: friendDoc.name,
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
          createdAt: conversation.createdAt,
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
    } catch (err) {
      console.log(err);
      return socket.emit("error", {
        message: err.message,
      });
    }
  });

  socket.on("join_a_chat_conversation", async ({ room_id }, callback) => {
    try {
      if (!room_id)
        return socket.emit("error", {
          message: "Room id is required",
        });

      const isConversationExists = await OneToOneConversation.findById(room_id);
      if (!Boolean(isConversationExists))
        return socket.emit("error", {
          message: "This conversation not exist",
          code: "CONV_NOT_EXIST",
          conv_id: room_id,
        });

      await socket.join(room_id);

      callback({ message: "Joined room" });
    } catch (err) {
      console.log(err);
      return socket.emit("error", {
        message: err.message,
      });
    }
  });

  socket.on("leave_chat_conversation", async ({ room_id }, callback) => {
    try {
      if (!room_id)
        return socket.emit("error", {
          message: "Room id is required",
        });

      await socket.leave(room_id);

      callback({ message: "Leaved room" });
    } catch (err) {
      console.log(err);
      return socket.emit("error", {
        message: err.message,
      });
    }
  });

  socket.on("send_message", async ({ message_id, room_id, user_id }) => {
    try {
      const conversation = await OneToOneConversation.findById(room_id);
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
};
