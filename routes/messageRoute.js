const { Router } = require("express");

const routes = new Router();

const messageCtrl = require("../controllers/messageCtrl");
const routeProtector = require("../middlewares/routeProtector");

// @Route http://localhost:9000/api/message/get_messages
// @Method GET get conversation messages
routes.get("/get_messages/:id", routeProtector, messageCtrl.getMessages);

// @Route http://localhost:9000/api/message/create_message
// @Method POST create a message
routes.post("/create_message", routeProtector, messageCtrl.createMessage);

// @Route http://localhost:9000/api/message/delete_message/:id
// @Method POST deleteMessage a message
routes.post("/delete_message", routeProtector, messageCtrl.deleteMessage);

// @Route http://localhost:9000/api/message/update_message/:id
// @Method POST update a message
routes.post("/update_message/:id", routeProtector, messageCtrl.updateMessage);

// @Route http://localhost:9000/api/message/get_replay_message/:conversation_id/:message_id
// @Method Get get replayed message
routes.get(
  "/find_replayed_message/:conversation_id/:message_id",
  routeProtector,
  messageCtrl.findReplayedMessage
);

module.exports = routes;
