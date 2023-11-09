const User = require("../models/user");
const FriendRequest = require("../models/friendRequest");
const i18next = require("../config/i18next");

module.exports = (socket, lang) => {
  const t = i18next(lang || "en");

  // send friend request to user
  socket.on("friend_request", async (data, callback) => {
    const to = await User.findById(data.to);

    // check if already a request exists
    const existing_request_from_sender = await FriendRequest.find({
      sender: data.from,
      reciver: data.to,
      status: "Pending",
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
      status: "Pending",
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

    callback("Request sent");
  });

  socket.on("accept_friend_request", async (data) => {
    const request = await FriendRequest.findById(data.request_id);
    if (!request)
      return socket.emit("request_not_exist", {
        message: "this request dos not exist enymore",
        request_id: data.request_id,
      });

    const user_sender = await User.findById(request.sender);
    const user_receiver = await User.findById(request.reciver);

    user_sender.friends.push(request.reciver._id);
    user_receiver.friends.push(request.sender._id);

    await user_sender.save({ new: true, validateModifiedOnly: true });
    await user_receiver.save({ new: true, validateModifiedOnly: true });

    request.status = "Accepted";
    await request.save({ new: true, validateModifiedOnly: true });

    socket.to(user_sender.socket_id).emit("your_friend_request_accepted", {
      message: t("UserName accepted your freind request", {
        username: `${user_receiver.firstname} ${user_receiver.lastname}`,
      }),
      request_id: request._id,
      friend: {
        _id: user_receiver._id,
        firstname: user_receiver.firstname,
        lastname: user_receiver.lastname,
        email: user_receiver.email,
        avatar: user_receiver.avatar,
      },
    });
    socket.emit("request_accepted", {
      message: t("UserName was added to your friends list", {
        username: `${user_sender.firstname} ${user_sender.lastname}`,
      }),
      request_id: request._id,
      friend: {
        _id: user_sender._id,
        firstname: user_sender.firstname,
        lastname: user_sender.lastname,
        email: user_sender.email,
        avatar: user_sender.avatar,
      },
    });
  });

  socket.on("reject_friend_request", async (data) => {
    const request = await FriendRequest.findById(data.request_id);
    if (!request)
      return socket.emit("request_not_exist", {
        message: "this request dos not exist enymore",
        request_id: data.request_id,
      });

    const user_sender = await User.findById(request.sender);
    const user_receiver = await User.findById(request.reciver);

    request.status = "Rejected";
    await request.save({ new: true, validateModifiedOnly: true });

    socket.to(user_sender.socket_id).emit("your_request_rejected", {
      message: t("UserName reject your friend request", {
        username: `${user_receiver.firstname} ${user_receiver.lastname}`,
      }),
      request_id: request._id,
    });
    socket.emit("request_rejected", {
      message: t("Request rejected successfully"),
      request_id: request._id,
    });
  });
  socket.on("delete_friend_request", async (data) => {
    const request = await FriendRequest.findById(data.request_id);
    if (!request)
      return socket.emit("error", { message: "Request not defined" });
    else {
      await FriendRequest.findByIdAndDelete(data.request_id);
      socket.emit("request_deleted", {
        message: "Request deleted successfuly",
        request_id: request._id,
      });
    }
  });
};
