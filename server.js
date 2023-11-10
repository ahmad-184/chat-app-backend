const http = require("http");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

const DbConnection = require("./config/db");
const i18 = require("./config/i18next");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
const app = require("./app");

const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  DbConnection();
  console.log(`server is running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});

// socket realtime functionalitis

const User = require("./models/user");
const friendRequest = require("./socket/friendRequest");
const oneToOneConversation = require("./socket/oneToOneConversation");

const socket_io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {},
});

socket_io.on("connection", async (socket) => {
  const user_id = socket.handshake.query.user_id;
  const authToken = socket.handshake.auth.token;
  const socket_id = socket.id;

  let current_lang = socket.handshake.query.lang;
  let t = i18(current_lang || "en");

  if (!Boolean(authToken)) {
    socket.emit(
      "error",
      t("You are not logged in! Please log in to get access")
    );
    socket.disconnect(0);
  }

  if (!Boolean(user_id)) {
    socket.emit("error", t("User id is required"));
  }

  const user = await User.findByIdAndUpdate(
    user_id,
    {
      socket_id,
      status: "Online",
    },
    { new: true }
  ).then((item) => {
    console.log(`${item.firstname} ${item.lastname} is ${item.status}`);
  });

  friendRequest(socket, current_lang);
  oneToOneConversation(socket, current_lang);

  socket.on("lang_changed", ({ lang }) => {
    current_lang = lang;
    t = i18(current_lang || "en");
  });

  socket.on("disconnect", async () => {
    await User.findByIdAndUpdate(
      user_id,
      { status: "Offline" },
      { new: true }
    ).then((item) => {
      console.log(`${item.firstname} ${item.lastname} is ${item.status}`);
    });
    socket.disconnect(0);
    // socket_io.close((err) => console.log(err));
  });
});
