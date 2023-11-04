const { socket_io } = require("../server");
const User = require("../models/user");

const friendRequest = require("./friendRequest");
const oneToOneMsg = require("./oneToOneMsg")

socket_io.on("connection", async (socket) => {
  const user_id = socket.handshake.query["user_id"];
  const socket_id = socket.id;

  if (Boolean(user_id) && Boolean(socket_id)) {
    await User.findByIdAndUpdate(user_id, {
      socket_id,
      status: "online",
    });
  }

  friendRequest(socket);
  oneToOneMsg(socket)

  socket.on("end", async (data) => {
    if (Boolean(data.user_id))
      await User.findByIdAndUpdate(data.user_id, { status: "Offline" })
    console.log("connection closed");
    socket.disconnect(0);
  });
});
