const User = require("../models/user");
const FriendRequest = require("../models/friendRequest");

module.exports = (socket, t) => {
  // send friend request to user
  socket.on("friend_request", async (data, callback) => {
    try {
      const to = await User.findById(data.to);
      const from = await User.findById(data.from);

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

      socket.to(to._id.toString()).emit("new_friend_request", {
        user_name: from.name,
      });

      callback("Request sent");
    } catch (err) {
      console.log(err);
      return socket.emit("error", {
        message: err.message,
      });
    }
  });

  socket.on("accept_friend_request", async (data, callback) => {
    try {
      const request = await FriendRequest.findById(data.request_id);
      if (!request)
        return socket.emit("request_not_exist", {
          message: "this request dos not exist enymore",
          request_id: data.request_id,
        });

      if (request.status === "Rejected")
        return socket.emit("request_not_exist", {
          message: "You reject this request",
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

      socket
        .to(user_sender._id.toString())
        .emit("your_friend_request_accepted", {
          message: t("UserName accepted your freind request", {
            username: user_receiver.name,
          }),
          request_id: request._id,
          friend: {
            _id: user_receiver._id,
            name: user_receiver.name,
            email: user_receiver.email,
            avatar: user_receiver.avatar,
          },
        });

      callback({
        user_name: user_sender.name,
        friend: {
          _id: user_sender._id,
          name: user_sender.name,
          email: user_sender.email,
          avatar: user_sender.avatar,
        },
      });
    } catch (err) {
      console.log(err);
      return socket.emit("error", {
        message: err.message,
      });
    }
  });

  socket.on("reject_friend_request", async function (data, callback) {
    try {
      const request = await FriendRequest.findById(data.request_id);
      if (!request)
        return socket.emit("request_not_exist", {
          message: "this request dos not exist enymore",
          request_id: data.request_id,
        });

      if (request.status === "Rejected")
        return socket.emit("request_not_exist", {
          message: "You already reject this request",
          request_id: data.request_id,
        });

      const user_sender = await User.findById(request.sender);
      const user_receiver = await User.findById(request.reciver);

      request.status = "Rejected";
      await request.save({ new: true, validateModifiedOnly: true });

      socket.to(user_sender._id.toString()).emit("your_request_rejected", {
        message: t("UserName reject your friend request", {
          username: user_receiver.name,
        }),
        request_id: request._id,
      });

      callback({
        message: t("Done"),
        request_id: request._id,
      });
    } catch (err) {
      console.log(err);
      return socket.emit("error", {
        message: err.message,
      });
    }
  });

  socket.on("delete_friend_request", async (data, callback) => {
    try {
      const request = await FriendRequest.findById(data.request_id);
      if (!request)
        return socket.emit("error", { message: "Request not defined" });
      else {
        await FriendRequest.findByIdAndDelete(data.request_id);

        callback({
          message: "Done",
          request_id: request._id,
        });
      }
    } catch (err) {
      console.log(err);
      return socket.emit("error", {
        message: err.message,
      });
    }
  });
};
