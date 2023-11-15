const crypto = require("crypto");

const optGenerator = require("otp-generator");

const mailSender = require("../services/mailer");

const User = require("../models/user");
const AppError = require("../helpers/AppError");
const { createToken } = require("../helpers/token");
const {
  registerValidator,
  loginValidator,
  emailValidator,
  passwordsValidator,
} = require("../validators");
const filterObj = require("../helpers/filterObj");

const otpTemplate = require("../templates/mail/otp");
const resetPassTemplate = require("../templates/mail/resetPassword");

const i18next = require("../config/i18next");

//* register user
//* if user exist and verified then we send a messeage.
//* if user exist but not verified then update user data and send otp code.
//* if user not exist we create user and send otp code.
exports.register = async (req, res, next) => {
  try {
    const lang = req.query.lang;

    const t = i18next(lang || "en");

    const filteredData = filterObj(
      req.body,
      "password",
      "confirmPassword",
      "firstname",
      "lastname",
      "email"
    );

    const validator = registerValidator(t);
    await validator.parse(filteredData);

    const existing_user = await User.findOne({ email: filteredData.email });

    if (existing_user && Boolean(existing_user.verified))
      throw new AppError(t("Email already in use, Please login"), 400);
    else if (existing_user) {
      //* update user data and send them to "verifyOtp" route.
      existing_user.firstname = filteredData.firstname;
      existing_user.lastname = filteredData.lastname;
      existing_user.email = filteredData.email;
      existing_user.password = filteredData.password;
      existing_user.confirmPassword = filteredData.confirmPassword;
      existing_user.passwordChangeAt = Date.now();

      await existing_user.save({ validateModifiedOnly: true });

      req.userId = existing_user._id;
      next();
    } else {
      //* create user and send them to verifyOtp route.
      const newUser = await User.create({ ...filteredData });
      req.userId = newUser._id;
      next();
    }
  } catch (err) {
    next(err);
  }
};

//* send otp code to they email
exports.sendOtp = async (req, res, next) => {
  try {
    const lang = req.query.lang;
    const userId = req.userId;

    const t = i18next(lang || "en");

    const user = await User.findById(userId);

    if (!user)
      throw new AppError(t("There is a problem, please try again"), 400);

    const generated_otp = optGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    const otp_expiry_time = Date.now() + 10 * 60 * 1000;

    user.otp = generated_otp;
    user.otp_expiry_time = otp_expiry_time;

    await user.save();

    // TODO send otp to user email
    const mailData = {
      recipient: user.email,
      subject: "Tawk - verification code",
      html: otpTemplate(user.firstname, generated_otp),
    };

    await mailSender(mailData);

    res.status(200).json({
      status: 200,
      message: t("The verification code has been sent to your email"),
      otp: generated_otp,
    });
  } catch (err) {
    next(err);
  }
};

//* verify otp code
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const lang = req.query.lang;

    const t = i18next(lang || "en");

    const validator = emailValidator(t);

    await validator.parse({ email });
    if (!otp) throw new AppError(t("verification code is required"), 400);

    const user = await User.findOne({ email });

    if (user.verified)
      throw new AppError(t("You already verified, please login"), 400);

    if (!user) throw new AppError(t("There is no user with this email"), 400);

    //* finding user with email and otp_expiry_time
    const isOtpExpired = await User.findOne({
      email,
      otp_expiry_time: { $gt: Date.now() },
    });

    if (!isOtpExpired)
      throw new AppError(
        t("The verification code has expired, send a request again"),
        400
      );

    if (!(await user.correctOTP(otp, user.otp)))
      throw new AppError(t("The verification code is incorrect"), 400);

    user.verified = true;
    user.otp = undefined;
    user.otp_expiry_time = undefined;

    await user.save();

    res.status(200).json({
      status: 200,
      message: t("Registration was successful. please login"),
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const lang = req.query.lang;

    const t = i18next(lang || "en");

    const { email, password } = req.body;

    if (!email || !password)
      throw new AppError(t("Both email and password is required"), 400);

    const validator = loginValidator(t);
    await validator.parse({ email, password });

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password)))
      throw new AppError(t("Email or password is incorrect"), 400);
    if (!user.verified)
      throw new AppError(
        t(
          "You are not allowed to access your account because your account has not been verified"
        ),
        401
      );

    const token = await createToken({ userId: user._id });

    const userInfo = {
      firstname: user.firstname,
      lastname: user.lastname,
      avatar: user.avatar,
      email: user.email,
      about: user.about,
    };

    res.status(200).json({
      status: 200,
      message: t("Logged in successfully"),
      token,
      user: userInfo,
      userId: user._id,
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const lang = req.query.lang;

    const t = i18next(lang || "en");

    if (!email) throw new AppError(t("email is required"), 400);

    const validator = emailValidator(t);
    await validator.parse({ email });

    const user = await User.findOne({ email });

    if (!user) throw new AppError(t("There is no user with this email"), 400);

    const currentTime = Date.now();

    if (
      user.forgotPasswordResendTimer < currentTime ||
      !user.forgotPasswordResendTimer
    ) {
      const resetToken = await crypto.randomBytes(32).toString("hex");

      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

      await user.save();

      const URL = `http://localhost:3000/auth/reset-password?code=${resetToken}`;
      console.log(URL);

      try {
        // TODO send URL to user email

        const mailData = {
          recipient: user.email,
          subject: "Tawk - Link to reset your password",
          html: resetPassTemplate(user.firstname, URL),
        };
        await mailSender(mailData);

        // 1 minute
        const timer = 1 * 60 * 1000;

        user.forgotPasswordResendTimer = Date.now() + timer;
        await user.save();

        res.status(200).json({
          status: 200,
          message: t("The password change link has been sent to your email"),
          resetToken,
        });
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false });

        throw new AppError(
          t(
            "Unfortunately, there is a problem in sending the email, please try again later"
          ),
          500
        );
      }
    } else throw new AppError("please try again after 3 minutes", 429);
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;
    const lang = req.query.lang;

    const t = i18next(lang || "en");

    if (!token) throw new AppError(t("Access denied"), 400);
    if (!password) throw new AppError(t("your new password is required"), 400);
    if (!confirmPassword)
      throw new AppError(t("confirm password is required", 400));

    const hashedToken = await crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({ passwordResetToken: hashedToken });

    if (!user)
      throw new AppError(
        t("You can change your password only once per request"),
        400
      );

    const isTokenExpired = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!isTokenExpired)
      throw new AppError(
        t("Your time to change your password has expired. Please apply again"),
        400
      );

    const validator = passwordsValidator(t);
    await validator.parse({ password, confirmPassword });

    user.password = password;
    user.confirmPassword = confirmPassword;
    user.passwordChangeAt = Date.now();

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // TODO send user a email to let know password changed successfully

    res.status(200).json({
      status: 200,
      message: t("Password changed successfully, Please login"),
    });
  } catch (err) {
    next(err);
  }
};
