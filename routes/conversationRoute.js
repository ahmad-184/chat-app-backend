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

// @Route http://localhost:9000/api/conversation/get_messages
// @Method GET get conversation messages
routes.get("/get_messages/:id", routeProtector, conversationCtrl.getMessages);

// @Route http://localhost:9000/api/conversation/create_message
// @Method POST create a message
routes.post("/create_message", routeProtector, conversationCtrl.createMessage);

module.exports = routes;
