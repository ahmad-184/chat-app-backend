const User = require("../models/user");
const FriendRequest = require("../models/friendRequest");
const i18next = require("../config/i18next");

module.exports = (socket) => {
  const t = i18next("en");

  socket.on("friend_request", async (data) => {
    const to = await User.findById(data.to);
    const from = await User.findById(data.from);

    const existing_request = await FriendRequest.find({
      sender: data.from,
      reciver: data.to,
    })

    if(existing_request.length === 0) {
      await FriendRequest.create({
        sender: data.from,
        reciver: data.to,
      });
  
      socket.to(to.socket_id).emit("new_friend_request", {
        message: t("New friend request recived"),
      });
      socket.to(from.socket_id).emit("friend_request_sent", {
        message: t("Request sent successfully"),
      });
    }
    else {
      socket.to(from.socket_id).emit("error", {
        message: t("You already sent request to this user"),
      });
    }
  });

  socket.on("accept_friend_request", async (data) => {
    const request = await FriendRequest.findById(data.request_id);

    const user_sender = await User.findById(request.sender);
    const user_recipient = await User.findById(request.recipient);

    user_sender.friends.push(request.recipient);
    user_recipient.friends.push(request.sender);

    await user_sender.save({ new: true, validateModifiedOnly: true });
    await user_recipient.save({ new: true, validateModifiedOnly: true });

    request.status = "Accepted"
    await request.save({ new: true, validateModifiedOnly: true })

    socket.to(user_recipient.socket_id).emit("accepted_friend_request", {
      message: t("UserName was added to your friends list", {
        username: `${user_sender.firstname} ${user_sender.lastname}`,
      }),
    });
    socket.to(user_sender.socket_id).emit("accepted_friend_request", {
      message: t("UserName accepted your freind request", {
        username: `${user_recipient.firstname} ${user_recipient.lastname}`,
      }),
    });
  });

  socket.on("reject_friend_request", async (data) => {
    const request = await FriendRequest.findById(data.request_id);

    const user_sender = await User.findById(request.sender);
    const user_recipient = await User.findById(request.recipient);

    request.status = "Rejected"
    await request.save({ new: true, validateModifiedOnly: true })

    socket.to(user_recipient.socket_id).emit("rejected_friend_request", {
      message: t("UserName request rejected successfully", {
        username: `${user_sender.firstname} ${user_sender.lastname}`,
      }),
    });
    socket.to(user_sender.socket_id).emit("rejected_friend_request", {
      message: t("UserName reject your friend request", {
        username: `${user_recipient.firstname} ${user_recipient.lastname}`,
      }),
    });
  });
  socket.on("delete_friend_request", async (data) => {
    // TODO delete friend request
  })
};
