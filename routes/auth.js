const express = require("express");
const asyncHandler = require("express-async-handler");
const validator = require("../controllers/validator");
const auth = require("../controllers/auth");
const helper = require("../controllers/helper");

const moduleRouter = express.Router();

const config = {
  name: "auth",
  parentRoute: "/auth",
};

moduleRouter.get("/", (req, res) => {
  res.json({
    message: "AUTH API - 🔐🗝",
  });
});

moduleRouter.post(
  "/login",
  validator.login,
  asyncHandler(helper.verify),
  asyncHandler(auth.passportLocal),
  asyncHandler(auth.token)
);

moduleRouter.post(
  "/signup",
  auth.signupAccess,
  validator.signup,
  asyncHandler(helper.verify),
  asyncHandler(auth.signup)
);

moduleRouter.get("/verify/:verificationToken?", asyncHandler(auth.verify));

module.exports = {
  moduleRouter,
  config,
};
