const express = require("express");
const asyncHandler = require("express-async-handler");
const validator = require("../controllers/validator");
const authValidator = require("../validators/auth-validator");
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

moduleRouter.post(
  "/changePassword",
  authValidator.changePassword,
  asyncHandler(helper.verify),
  asyncHandler(auth.passportLocal),
  asyncHandler(auth.changePassword)
);

module.exports = {
  moduleRouter,
  config,
};
