const User = require("../models/user");
const FriendRequest = require("../models/friendRequest");
const OneToOneConversation = require("../models/oneToOneConversation");
const Message = require("../models/message");
const AppError = require("../helpers/AppError");
const filterObj = require("../helpers/filterObj");
const { updateUserInfo } = require("../validators");

exports.updateMe = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) throw new AppError("user doc not found.", 500);

    const filteredData = filterObj(
      req.body,
      "firstname",
      "lastname",
      "about",
      "avatar"
    );

    await updateUserInfo.parse(filteredData);

    const updatedUser = await User.findByIdAndUpdate(user._id, filteredData, {
      new: true,
      validateModifiedOnly: true,
    });

    res.status(200).json({
      status: 200,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const this_user = req.user;

    const allUsers = await User.find({ verified: true }).select(
      "firstname lastname email avatar _id status"
    );

    const filteredUsers = allUsers.filter(
      (user) =>
        !this_user.friends.includes(user._id) &&
        user._id.toString() !== this_user._id.toString()
    );

    res.status(200).json({
      status: 200,
      data: filteredUsers,
    });
  } catch (err) {
    next(err);
  }
};

exports.getFriends = async (req, res, next) => {
  try {
    const { friends } = await User.findById(req.user._id).populate(
      "friends",
      "firstname lastname email avatar _id  status"
    );

    res.status(200).json({
      status: 200,
      data: friends,
    });
  } catch (err) {
    next(err);
  }
};

// first: get friends request you set
// second: get friend request user set to you
exports.getFriendRequests = async (req, res, next) => {
  try {
    const friendRequests_forMe = await FriendRequest.find({
      reciver: req.user._id,
      status: "Pending",
    }).populate("sender", "firstname email lastname avatar _id  status");

    const FriendRequest_I_Sent = await FriendRequest.find({
      sender: req.user._id,
    }).populate("reciver", "firstname email lastname avatar _id  status");

    res.status(200).json({
      status: 200,
      data: {
        received: friendRequests_forMe,
        sent: FriendRequest_I_Sent,
      },
    });
  } catch (err) {
    next(err);
  }
};
