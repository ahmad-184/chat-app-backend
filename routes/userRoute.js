const { Router } = require("express");

const userCtrl = require("../controllers/userCtrl");
const routeProtector = require("../middlewares/routeProtector");

const routes = new Router();

// @Route http://localhost:9000/api/user/update_me
// @Method POST update user info
routes.post("/update_me", routeProtector, userCtrl.updateMe);

// @Route http://localhost:9000/api/user/get_users
// @Method GET get all users but not user and user friends
routes.get("/get_users", routeProtector, userCtrl.getUsers);

// @Route http://localhost:9000/api/user/get_friends
// @Method GET get user friends
routes.get("/get_friends", routeProtector, userCtrl.getFriends);

// @Route http://localhost:9000/api/user/get_friend_requests
// @Method GET get user friend requests
routes.get("/get_friend_requests", routeProtector, userCtrl.getFriendRequests);

// @Route http://localhost:9000/api/user/get_conversations
// @Method GET get user conversations
routes.get("/get_conversations", routeProtector, userCtrl.getConversations);

module.exports = routes;
