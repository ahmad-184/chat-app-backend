const { Router } = require("express");

const routes = new Router();

const authCtrl = require("../controllers/authCtrl");

// @Route http://localhost:9000/api/auth/login
// @Method POST login user
routes.post("/login", authCtrl.login);

// @Route http://localhost:9000/api/auth/login
// @Desc POST register user and send otp to email of them
routes.post("/register", authCtrl.register, authCtrl.sendOtp);

// @Route http://localhost:9000/api/auth/verify_account
// @Desc POST verify user account by otp code
routes.post("/verify_account", authCtrl.verifyOtp);

// @Route http://localhost:9000/api/auth/forgot_password
// @Desc POST create a resetToken and sent to user email
routes.post("/forgot_password", authCtrl.forgotPassword);

// @Route http://localhost:9000/api/auth/reset_password
// @Desc POST validate resetToken and change user password
routes.post("/reset_password", authCtrl.resetPassword);

module.exports = routes;
