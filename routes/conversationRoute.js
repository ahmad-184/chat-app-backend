const { Router } = require("express");

const routes = new Router();

const conversationCtrl = require("../controllers/conversationCtrl");
const routeProtector = require("../middlewares/routeProtector");

// @Route http://localhost:9000/api/conversation/get_messages
// @Method GET get conversation messages
routes.get("/get_messages/:id", routeProtector, conversationCtrl.getMessages);

module.exports = routes;
