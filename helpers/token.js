const jwt = require("jsonwebtoken");

exports.createToken = async (content) =>
  await jwt.sign({ ...content, iat: Date.now() }, process.env.JWT_SECRET, {});

exports.decodeToken = async (token) => await jwt.decode(token);
