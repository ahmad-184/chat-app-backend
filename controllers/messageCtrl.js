const Message = require("../models/message");
const Conversation = require("../models/conversation");
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
    console.log(data);
    const conversation = await Conversation.findById(data.conversation_id);
    if (!conversation)
      throw new AppError("This conversation dos not exist", 400);
    data.status = "Delivered";
    await Message.create({ ...data });
    const createdMessage = await Message.findById(data._id).populate("replay");

    res.status(203).json({
      status: "OK",
      message_id: createdMessage._id,
      message: createdMessage,
    });
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

exports.findReplayedMessage = async (req, res, next) => {
  try {
    const message_id = req.params.message_id;
    const conversation_id = req.params.conversation_id;

    const isMessageExist = await Message.findById(message_id);
    if (!isMessageExist) throw new AppError("this message does not exist", 400);

    const numberOfMessages = await Message.find({
      conversation_id: conversation_id,
    }).countDocuments();

    const messages = await Message.find({
      conversation_id: conversation_id,
    })
      .populate("replay")
      .sort({ createdAt: -1 });

    const chunkSize = req.perPage || 25;
    const chunks = [];

    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);
      chunks.push(chunk);
    }

    let data = [];
    let isMsgFound = false;
    let perPage = req.perPage || 25;
    let page;

    chunks.forEach((pack, index) => {
      if (isMsgFound) return;
      for (let msg of pack) {
        if (msg._id.toString() === message_id.toString()) {
          isMsgFound = true;
        }
      }
      if (!isMsgFound) {
        data = [...data, ...pack];
      } else {
        data = [...data, ...pack];
        page = index + 1;
        return;
      }
    });

    res.status(200).json({
      currentPage: page,
      nextPage: page + 1,
      hasNextPage: perPage * page < numberOfMessages,
      status: 200,
      data,
    });
  } catch (err) {
    next(err);
  }
};
