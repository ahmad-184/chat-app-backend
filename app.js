const express = require("express");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const xss = require("xss-clean");
const session = require("express-session");

const AppError = require("./helpers/AppError");

//* import routes
const routes = require("./routes");

//* Global Error Handler
const globalErrorHandler = require("./controllers/errCtrl");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["PATCH", "GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(mongoSanitize());

app.use(xss());

const sess = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
};

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.set("trust proxy", 1);
  sess.cookie.secure = true;
}

app.use(session(sess));

//* Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

const rootRouteLimiter = rateLimit({
  limit: 1000,
  window: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again after an hour",
});

app.use("/api", rootRouteLimiter, routes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//* error handler
app.use(globalErrorHandler);

module.exports = app;
