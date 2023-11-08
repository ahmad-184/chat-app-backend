const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const AppError = require("../helpers/AppError");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "firstname is reqiured."],
  },
  lastname: {
    type: String,
    required: [true, "lastname is reqiured."],
  },
  email: {
    type: String,
    required: [true, "email is reqiured."],
    unique: true,
    validate: {
      validator: (email) => {
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      },
      message: (props) => `Email (${props.value}) is invalid!`,
    },
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  confirmPassword: {
    type: String,
    required: [true, "confirm password is required"],
  },
  about: {
    type: String,
    default: "Hello World",
  },
  avatar: {
    type: String,
    default: "",
    // default: "https://avatar.iran.liara.run/public",
  },
  passwordChangeAt: {
    type: Date,
    default: Date.now(),
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otp_expiry_time: {
    type: Date,
  },
  forgotPasswordResendTimer: {
    type: Date,
    default: Date.now(),
  },
  socket_id: {
    type: String,
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  status: {
    type: String,
    default: "Offline",
    enum: ["Offline", "Online"],
  },
  blocks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// hashing password before creating user or updating password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.isModified("confirmPassword"))
    return next();

  try {
    const passwordHash = await bcrypt.hash(this.password, 10);
    const confirmPasswordHash = await bcrypt.hash(this.confirmPassword, 10);

    this.password = passwordHash;
    this.confirmPassword = confirmPasswordHash;
    console.log("pre save working");
    next();
  } catch (err) {
    return new AppError(err.message, 500);
  }
});

// hashing the otp before updating
userSchema.pre("save", async function (next) {
  if (!this.isModified("otp")) return next();

  try {
    const hash = await bcrypt.hash(this.otp, 10);
    this.otp = hash;
    next();
  } catch (err) {
    return new AppError(err.message, 500);
  }
});

// check if passwords are correct or not, return true / false
userSchema.methods.correctPassword = function (candidatePass, userPass) {
  return bcrypt.compare(candidatePass, userPass);
};

// check if otp's are correct or not, return true / false
userSchema.methods.correctOTP = function (candidateOTP, userOTP) {
  return bcrypt.compare(candidateOTP, userOTP);
};

module.exports = mongoose.model("User", userSchema);
