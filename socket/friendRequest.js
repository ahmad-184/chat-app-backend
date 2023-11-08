const User = require("../models/user");
const FriendRequest = require("../models/friendRequest");
const i18next = require("../config/i18next");

module.exports = (socket, lang) => {
  const t = i18next(lang || "en");

  // send friend request to user
  socket.on("friend_request", async (data) => {
    const to = await User.findById(data.to);
    const from = await User.findById(data.from);

    // check if already a request exists
    const existing_request_from_sender = await FriendRequest.find({
      sender: data.from,
      reciver: data.to,
    });

    if (existing_request_from_sender.length)
      return socket.emit("error", {
        message: t("You already sent request to this user"),
      });

    // check if who we want send friend request to him/her is already set a friend request to us
    // check if already a request exists
    const existing_request_from_receiver = await FriendRequest.find({
      sender: data.to,
      reciver: data.from,
    });
    if (existing_request_from_receiver.length)
      return socket.emit("error", {
        message: t("this user is sent friend request to you"),
      });

    await FriendRequest.create({
      sender: data.from,
      reciver: data.to,
    });

    socket.to(to.socket_id).emit("new_friend_request", {
      message: t("New friend request recived"),
    });
    socket.emit("friend_request_sent", {
      message: t("Request sent successfully"),
    });
  });

  socket.on("accept_friend_request", async (data) => {
    const request = await FriendRequest.findById(data.request_id);

    const user_sender = await User.findById(request.sender);
    const user_receiver = await User.findById(request.reciver);

    user_sender.friends.push(request.reciver._id);
    user_receiver.friends.push(request.sender._id);

    await user_sender.save({ new: true, validateModifiedOnly: true });
    await user_receiver.save({ new: true, validateModifiedOnly: true });

    request.status = "Accepted";
    await request.save({ new: true, validateModifiedOnly: true });

    socket.to(user_sender.socket_id).emit("accepted_friend_request", {
      message: t("UserName accepted your freind request", {
        username: `${user_receiver.firstname} ${user_receiver.lastname}`,
      }),
    });
    socket.emit("accepted_friend_request", {
      message: t("UserName was added to your friends list", {
        username: `${user_sender.firstname} ${user_sender.lastname}`,
      }),
    });
  });

  socket.on("reject_friend_request", async (data) => {
    const request = await FriendRequest.findById(data.request_id);

    const user_sender = await User.findById(request.sender);
    const user_receiver = await User.findById(request.reciver);

    request.status = "Rejected";
    await request.save({ new: true, validateModifiedOnly: true });

    socket.to(user_sender.socket_id).emit("rejected_request", {
      message: t("UserName reject your friend request", {
        username: `${user_receiver.firstname} ${user_receiver.lastname}`,
      }),
    });
    socket.emit("rejected_friend_request", {
      message: t("Request rejected successfully"),
    });
  });
  socket.on("delete_friend_request", async (data) => {
    // TODO delete friend request
  });
};
