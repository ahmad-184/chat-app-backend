const User = require("../models/user");
const FriendRequest = require("../models/friendRequest");
const AppError = require("../helpers/AppError");
const filterObj = require("../helpers/filterObj");
const { updateUserInfo } = require("../validators");

exports.updateMe = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) throw new AppError("user doc not found.", 500);

    const filteredData = filterObj(req.body, "name", "about", "avatar");

    await updateUserInfo.parse(filteredData);

    const updatedUser = await User.findByIdAndUpdate(user._id, filteredData, {
      new: true,
      validateModifiedOnly: true,
    });

    const userInfo = {
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      about: updatedUser.about,
    };

    res.status(200).json({
      status: 200,
      message: "Done",
      user: userInfo,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const this_user = req.user;

    const allUsers = await User.find({ verified: true }).select(
      "name email avatar _id status"
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
      "name email avatar _id  status"
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
    }).populate("sender", "name email avatar _id  status");

    const FriendRequest_I_Sent = await FriendRequest.find({
      sender: req.user._id,
    }).populate("reciver", "name email avatar _id  status");

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
