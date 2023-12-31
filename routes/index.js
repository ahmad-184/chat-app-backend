const routes = require("express").Router();
const rateLimit = require("express-rate-limit");

const authRoutes = require("./authRoute");
const userRoutes = require("./userRoute");
const conversationRoute = require("./conversationRoute");
const messageRoute = require("./messageRoute");

const AuthRoutelimiter = rateLimit({
  limit: 25,
  window: 30 * 60 * 1000,
  message: "Too many requests, please try again after 30 minutes",
});

routes.use("/auth", AuthRoutelimiter, authRoutes);
routes.use("/user", userRoutes);
routes.use("/conversation", conversationRoute);
routes.use("/message", messageRoute);

module.exports = routes;
