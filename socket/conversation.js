const User = require("../models/user");
const Conversations = require("../models/conversation");
const Message = require("../models/message");
const filterObj = require("../helpers/filterObj");

module.exports = (socket, t) => {
  socket.on("start_conversation", async ({ friend_id, user_id }, callback) => {
    try {
      const isConversationExists = await Conversations.find({
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
      const userDoc = await User.findById(user_id);

      let data = {
        friend_id: friendDoc._id,
        name: friendDoc.name,
        avatar: friendDoc.avatar,
        status: friendDoc.status,
        lastSeen: friendDoc.lastSeen || "",
        typing: false,
        users: [friendDoc, userDoc].map((item) => ({
          _id: item._id,
          email: item.email,
          name: item.name,
          avatar: item.avatar,
        })),
      };

      // convertion dos not exist. create conversation and sed it to user
      if (!Boolean(isConversationExists.length)) {
        const conversation = await Conversations.create({
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

      const isConversationExists = await Conversations.findById(room_id);
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
};
