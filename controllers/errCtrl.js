const i18next = require("../config/i18next");
const AppError = require("../helpers/AppError");

//* error functions
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  //* const [val] = Object.keys(err.keyValue);

  const val = Object.keys(err.keyValue);

  const message = `Duplicate field value: ${val.join(
    ". "
  )}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = (t) =>
  new AppError(t("Invalid token. Please log in again!"), 401);

const handleJWTExpiredError = (t) =>
  new AppError(t("Your token has expired! Please log in again."), 401);

const handleZodError = (err) => {
  const errs = err.errors.map((item) => item.message);
  return new AppError(`${errs.join(", ")}`, 400);
};

const sendZodError = (err, req, res) => {
  const errs = err.errors.map((item) => item.message);

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: `${errs.join(", ")}`,
    stack: err.stack,
  });
};

//* Handle Send Production Error

const sendErrorProd = (err, req, res) => {
  //* A) API

  //* A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  //* B) Programming or other unknown error: don't leak error details
  //* 1) Log error

  //* 2) Send generic message
  return res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
};

//* Handle Send Development Error
const sendErrorDev = (err, req, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  const lang = req.query.lang;

  const t = i18next(lang || "en");

  if (process.env.NODE_ENV === "development") {
    if (err.name === "ZodError") return sendZodError(err, req, res);
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    error.message = err.message;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error._message === "User validation failed") {
      error = handleValidationErrorDB(error);
    }
    if (error.name === "JsonWebTokenError") error = handleJWTError(t);
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError(t);
    if (error.name === "ZodError") error = handleZodError(error);

    sendErrorProd(error, req, res);
  }
};
