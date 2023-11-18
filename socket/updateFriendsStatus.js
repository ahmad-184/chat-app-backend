const User = require("../models/user");

module.exports = async (socket, user_id, socket_id, status) => {
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
    console.log(`${item.firstname} ${item.lastname} is ${item.status}`);
  });
  const { friends, status: user_status } = await User.findById(
    user_id
  ).populate("friends");

  Promise.all([
    friends.map(({ socket_id }) => {
      socket.to(socket_id).emit("update_friends_status", {
        friend_id: user_id,
        friend_status: user_status,
        lastSeen: Date.now(),
      });
    }),
  ]);
};
