const Message = require("../models/message");
const Conversations = require("../models/conversation");
const User = require("../models/user");
const AppError = require("../helpers/AppError");
const filterObj = require("../helpers/filterObj");

exports.getConversations = async (req, res, next) => {
  try {
    const user_id = req.user._id;
    let conversations = [];
    const user_conversations = await Conversations.find({
      users: {
        $all: [user_id],
      },
    });

    if (user_conversations.length) {
      for (const conversation of user_conversations) {
        let usersDoc = [];

        for (const id of conversation.users) {
          await User.findById(id.toString()).then((data) => {
            usersDoc.push(data);
          });
        }

        const friendDoc = usersDoc.find(
          (item) => item._id.toString() !== user_id.toString()
        );

        const messages = await Message.find({
          conversation_id: conversation._id,
        }).sort({ createdAt: "desc" });

        const unseenMessagesCount = await Message.find({
          conversation_id: conversation._id,
          sender: friendDoc._id,
          status: "Delivered",
        });

        const unseen = unseenMessagesCount.map((item) => item._id.toString());

        let data = {
          _id: conversation._id,
          friend_id: friendDoc._id,
          name: friendDoc.name,
          avatar: friendDoc.avatar,
          status: friendDoc.status,
          lastSeen: friendDoc.lastSeen || "",
          last_message: messages[0] || {},
          typing: false,
          unseen,
          users: usersDoc.map((item) => ({
            _id: item._id,
            email: item.email,
            name: item.name,
            avatar: item.avatar,
          })),
          createdAt: conversation.createdAt,
        };

        conversations.push(data);
      }
      res.status(200).json({ data: conversations, status: 200 });
    } else {
      res.status(200).json({ data: [], status: 200 });
    }
  } catch (err) {
    next(err);
  }
};
