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
  authValidator.login,
  asyncHandler(helper.verify),
  asyncHandler(auth.passportLocal),
  asyncHandler(auth.token)
);

moduleRouter.post(
  "/sessionlogin",
  authValidator.login,
  asyncHandler(helper.verify),
  asyncHandler(auth.passportLocal),
  asyncHandler(auth.generateSession),
  asyncHandler(auth.signAuthToken)
);

moduleRouter.post(
  "/refreshToken",
  authValidator.refreshToken,
  asyncHandler(helper.verify),
  asyncHandler(auth.refreshAuthToken),
  asyncHandler(auth.signAuthToken)
);

moduleRouter.post(
  "/signup",
  authValidator.signup,
  asyncHandler(helper.verify),
  asyncHandler(auth.signup)
);

moduleRouter.post(
  "/sessionsignup",
  authValidator.signup,
  asyncHandler(helper.verify),
  asyncHandler(auth.sessionsignup),
  asyncHandler(auth.generateSession),
  asyncHandler(auth.signAuthToken)
);

moduleRouter.post(
  "/socialsignin/google",
  authValidator.googleSignIn,
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

moduleRouter.post(
  "/setPassword",
  authValidator.setPassword,
  asyncHandler(helper.verify),
  asyncHandler(auth.passportJwt),
  asyncHandler(auth.setPassword)
);

moduleRouter.post(
  "/logout",
  authValidator.refreshToken,
  asyncHandler(helper.verify),
  asyncHandler(auth.clearSession)
);

moduleRouter.post(
  "/forgotPassword",
  authValidator.forgotPassword,
  asyncHandler(helper.verify),
  asyncHandler(auth.forgotPassword)
);

moduleRouter.post(
  "/resetPassword",
  authValidator.resetPassword,
  asyncHandler(helper.verify),
  asyncHandler(auth.resetPassword)
);

module.exports = {
  moduleRouter,
  config,
};
