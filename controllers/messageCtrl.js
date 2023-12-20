const Message = require("../models/message");
const OneToOneConversation = require("../models/oneToOneConversation");
const AppError = require("../helpers/AppError");

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

exports.deleteMessage = async (req, res, next) => {
  try {
    const { id: messageId } = req.body;
    if (!messageId) throw new AppError("message id is required");
    const message = await Message.findById(messageId);
    if (!message) throw new AppError("This message does not exist");
    await Message.findByIdAndUpdate(
      messageId,
      {
        deleted: true,
      },
      { new: true, runValidators: true }
    );
    return res.status(200).json({
      message_id: messageId,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateMessage = async (req, res, next) => {
  try {
    // const { id: messageId } = req.query;
    // if (!messageId) throw new AppError("message id is required");
    // const message = await Message.findById(messageId);
    // if (!message) throw new AppError("This message does not exist");
    // await Message.findByIdAndDelete(messageId);
    // return res.status(200).json({
    //   message_id: messageId,
    // });
  } catch (err) {
    next(err);
  }
};
