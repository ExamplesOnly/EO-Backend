const express = require("express");
const asyncHandler = require("express-async-handler");
const auth = require("../controllers/auth");
const user = require("../controllers/user");

const moduleRouter = express.Router();

const config = {
  name: "user",
  parentRoute: "/user",
};

moduleRouter.get(
  "/me",
  //   asyncHandler(auth.passportJwt),
  asyncHandler(user.me)
);

module.exports = {
  moduleRouter,
  config,
};
