const { Router } = require("express");

const routes = new Router();

const conversationCtrl = require("../controllers/conversationCtrl");
const routeProtector = require("../middlewares/routeProtector");

// @Route http://localhost:9000/api/conversation/get_conversations
// @Method GET get user conversations
routes.get(
  "/get_conversations",
  routeProtector,
  conversationCtrl.getConversations
);

module.exports = routes;
