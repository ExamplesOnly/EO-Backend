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
  "/sessionlogin",
  validator.login,
  asyncHandler(helper.verify),
  asyncHandler(auth.passportLocal),
  asyncHandler(auth.generateSession),
  asyncHandler(auth.signAuthToken)
);

moduleRouter.post(
  "/refreshToken",
  validator.refreshToken,
  asyncHandler(helper.verify),
  asyncHandler(auth.refreshAuthToken)
);

moduleRouter.post(
  "/signup",
  validator.signup,
  asyncHandler(helper.verify),
  asyncHandler(auth.signup)
);

// moduleRouter.post(
//   "/sessionsignup",
//   validator.signup,
//   asyncHandler(helper.verify),
//   asyncHandler(auth.signup)
// );

moduleRouter.post(
  "/socialsignin/google",
  validator.googleSignIn,
  asyncHandler(helper.verify),
  asyncHandler(auth.validateGoogleAccessToken),
  asyncHandler(auth.googleLogin),
  asyncHandler(auth.validateUser),
  asyncHandler(auth.generateSession),
  asyncHandler(auth.signAuthToken)
);

moduleRouter.get("/verify/:verificationToken?", asyncHandler(auth.verify));

moduleRouter.post(
  "/changePassword",
  authValidator.changePassword,
  asyncHandler(helper.verify),
  asyncHandler(auth.passportLocal),
  asyncHandler(auth.changePassword)
);

// moduleRouter.post(
//   "/forgotPassword",
//   authValidator.changePassword,
//   asyncHandler(helper.verify),
//   asyncHandler(auth.passportLocal),
//   asyncHandler(auth.changePassword)
// );

module.exports = {
  moduleRouter,
  config,
};
