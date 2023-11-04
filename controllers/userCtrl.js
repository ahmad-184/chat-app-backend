const User = require("../models/user");
const FriendRequest = require("../models/friendRequest");
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
      "firstname lastname avatar _id"
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
      "firstnamae lastname avatar _id"
    );

    res.status(200).json({
      status: 200,
      data: friends,
    });
  } catch (err) {
    next(err);
  }
};

exports.getFriendRequests = async (req, res, next) => {
  try {
    const requests = await FriendRequest.find({
      recipient: req.user._id,
    }).populate("sender", "firstnamae lastname avatar _id");

    res.status(200).json({
      status: 200,
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};
