const { Router } = require("express");

const userCtrl = require("../controllers/userCtrl");
const routeProtector = require("../middlewares/routeProtector");

const routes = new Router();

// @Route http://localhost:9000/api/user/update_me
// @Method POST update user info
routes.post("/update_me", routeProtector, userCtrl.updateMe);

module.exports = routes;
