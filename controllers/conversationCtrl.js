const Message = require("../models/message");
const OneToOneConversation = require("../models/oneToOneConversation");
const User = require("../models/user");
const AppError = require("../helpers/AppError");

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
      const friend_id = conversation.users.find(
        (item) => item.toString() !== user_id.toString()
      );
      const friendDoc = await User.findById(friend_id);

      const messages = await Message.find({
        conversation_id: conversation._id,
      }).sort({ createdAt: "desc" });

      const unseenMessagesCount = await Message.find({
        conversation_id: conversation._id,
        sender: friend_id,
        status: "Delivered",
      });

      const unseen = unseenMessagesCount.map((item) => item._id.toString());

      let data = {
        _id: conversation._id,
        friend_id: friendDoc._id,
        name: `${friendDoc.firstname} ${friendDoc.lastname}`,
        avatar: friendDoc.avatar,
        status: friendDoc.status,
        lastSeen: friendDoc.lastSeen || "",
        last_message: messages[0] || {},
        typing: false,
        unseen,
        createdAt: conversation.createdAt,
      };
      console.log(unseen);

      conversations.push(data);
    }
    res.status(200).json({ data: conversations, status: 200 });
  } catch (err) {
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const perPage = req.perPage || 25;
    const page = parseInt(req.query.page) + 1 || 1;

    const { id } = req.params;
    const numberOfMessages = await Message.find({
      conversation_id: id,
    }).countDocuments();
    const messages = await Message.find({ conversation_id: id })
      .populate("replay")
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(25);

    res.status(200).json({
      data: messages,
      currentPage: page,
      nextPage: page + 1,
      hasNextPage: perPage * page < numberOfMessages,
      status: 200,
    });
  } catch (err) {
    next(err);
  }
};

exports.createMessage = async (req, res, next) => {
  try {
    const data = req.body;
    const conversation = await OneToOneConversation.findById(
      data.conversation_id
    );
    if (!conversation)
      throw new AppError("This conversation dos not exist", 400);
    data.status = "Delivered";
    const message = await Message.create({ ...data });

    res.status(203).json({ status: "OK", message_id: message._id, message });
  } catch (err) {
    next(err);
  }
};
