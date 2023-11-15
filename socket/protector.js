const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

module.exports = async (socket, t) => {
  const user_id = socket.handshake.query.user_id;
  const token = socket.handshake.auth.token;

  if (!Boolean(token) || !Boolean(user_id)) {
    socket.emit(
      "auth_error",
      t("You are not logged in! Please log in to get access")
    );
    socket.disconnect(0);
  }

  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const currentUser = await User.findById(decodedToken.userId);

  if (!currentUser) {
    socket.emit(
      "auth_error",
      t("The user belonging to this token does no longer exist")
    );
    socket.disconnect(0);
  }

  if (!currentUser.verified) {
    socket.emit("auth_error", t("Access denied, your account not verified."));
    socket.disconnect(0);
  }

  //* check if user changed their password after created token
  if (decodedToken.iat < currentUser.passwordChangeAt) {
    socket.emit(
      "auth_error",
      t("User recently updated password! please log in again.")
    );
    socket.disconnect(0);
  }
};
