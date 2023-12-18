const User = require("../models/user");

module.exports = async (socket, user_id, socket_id, status) => {
  try {
    await User.findByIdAndUpdate(
      user_id,
      {
        status,
        socket_id,
        // ...(status === "Offline" && { lastSeen: Date.now() }),
        lastSeen: Date.now(),
      },
      { new: true }
    ).then(async (item) => {
      console.log(`${item.name} is ${item.status}`);
    });
    const { friends, status: user_status } = await User.findById(
      user_id
    ).populate("friends");

    Promise.all([
      friends.map(({ _id }) => {
        socket.to(_id.toString()).emit("update_friends_status", {
          friend_id: user_id,
          friend_status: user_status,
          lastSeen: Date.now(),
        });
      }),
    ]);
  } catch (err) {
    console.log(err);
    return socket.emit("error", {
      message: err.message,
    });
  }
};
