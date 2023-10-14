const User = require("../models/user");
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
