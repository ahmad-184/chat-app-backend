const http = require("http");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

const DbConnection = require("./config/db");

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

// socket functionalitis

const User = require("./models/user")
const friendRequest = require("./socket/friendRequest")
const oneToOneConversation = require("./socket/oneToOneConversation")

const socket_io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

socket_io.on("connection", async (socket) => {
  console.log('load')
  const user_id = socket.handshake.query["user_id"];
  const socket_id = socket.id;

  if (Boolean(user_id) && Boolean(socket_id)) {
    await User.findByIdAndUpdate(user_id, {
      socket_id,
      status: "Online",
    });
  }

  friendRequest(socket);
  oneToOneConversation(socket)

  socket.on("end", async (data) => {
    if (Boolean(data.user_id))
      await User.findByIdAndUpdate(data.user_id, { status: "Offline" })
    console.log("connection closed");
    socket.disconnect(0);
  });
})