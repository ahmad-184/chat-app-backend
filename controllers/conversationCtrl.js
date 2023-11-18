const { v4: uuid4 } = require("uuid");

const Message = require("../models/message");
const OneToOneConversation = require("../models/oneToOneConversation");
const User = require("../models/user");

exports.getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({ conversation_id: id }).populate(
      "replay"
    );

    let itemsArray = [];
    let date = "";
    for (let item of messages) {
      if (!date || date === "" || !date.length) {
        date = item.createdAt_day;
        itemsArray = [
          {
            _id: uuid4(),
            type: "timeline",
            date: item.createdAt_day,
          },
          item,
        ];
      } else if (date && date === item.createdAt_day) {
        itemsArray.push(item);
      } else if (date && date !== item.createdAt_day) {
        date = item.createdAt_day;
        itemsArray = [
          ...itemsArray,
          {
            _id: uuid4(),
            type: "timeline",
            date: item.createdAt_day,
          },
          item,
        ];
      }
    }

    res.status(200).json({ data: itemsArray, status: 200 });
  } catch (err) {
    next(err);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const user_id = req.user._id;
    let conversations = [];
    const user_conversations = await OneToOneConversation.find({
      users: {
        $all: [user_id],
      },
    });

    for (let conversation of user_conversations) {
      const friend_id = conversation.users.filter(
        (item) => item.toString() !== user_id.toString()
      );
      const friendDoc = await User.findById(friend_id[0]);

      const messages = await Message.find({
        conversation_id: conversation._id,
      }).sort({ createdAt: "desc" });

      const unseenMessagesCount = await Message.find({
        conversation_id: conversation._id,
      }).countDocuments();

      let data = {
        _id: conversation._id,
        friend_id: friendDoc._id,
        name: `${friendDoc.firstname} ${friendDoc.lastname}`,
        avatar: friendDoc.avatar,
        status: friendDoc.status,
        lastSeen: friendDoc.lastSeen || "",
        last_message: messages[0] || {},
        typing: false,
        unseen: unseenMessagesCount || 0,
      };

      conversations.push(data);
    }
    res.status(200).json({ data: conversations, status: 200 });
  } catch (err) {
    next(err);
  }
};
