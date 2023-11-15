const Message = require("../models/message");

exports.getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({ conversation_id: id }).populate(
      "replay"
    );
    console.log(messages);
    res.status(200).json({ data: messages, status: 200 });
  } catch (err) {
    next(err);
  }
};
