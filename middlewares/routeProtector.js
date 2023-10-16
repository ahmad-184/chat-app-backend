const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const i18next = require("../config/i18next");

const User = require("../models/user");
const AppError = require("../helpers/AppError");

const auth = async (req, res, next) => {
  try {
    const lang = req.query.lang;

    const t = i18next(lang || "en");

    let token = req.header("Authorization");
    if (token && token.startsWith("Bearer")) {
      const splitedToken = token.split(" ");
      token = splitedToken[1];
    } else if (req.cookie.token) {
      token = req.cookie.token;
    } else {
      throw new AppError(
        t("You are not logged in! Please log in to get access"),
        401
      );
    }

    const decodedToken = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    const currentUser = await User.findById(decodedToken.userId);

    if (!currentUser)
      throw new AppError(
        t("The user belonging to this token does no longer exist."),
        401
      );

    //* check if user changed their password after created token
    if (await currentUser.passwordChangedAfter(decodedToken.iat))
      throw new AppError(
        t("User recently updated password! please log in again."),
        401
      );

    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
