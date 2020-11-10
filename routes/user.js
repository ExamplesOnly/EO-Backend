const express = require("express");
const asyncHandler = require("express-async-handler");
const auth = require("../controllers/auth");
const user = require("../controllers/user");
const validator = require("../controllers/validator");
const helper = require("../controllers/helper");

const moduleRouter = express.Router();

const config = {
  name: "user",
  parentRoute: "/user",
};

moduleRouter.get("/me", asyncHandler(auth.passportJwt), asyncHandler(user.me));

moduleRouter.post(
  "/addInterests",
  asyncHandler(auth.passportJwt),
  validator.addInterests,
  asyncHandler(helper.verify),
  asyncHandler(user.addInterests)
);

moduleRouter.post(
  "/update/profileImage",
  asyncHandler(user.uploadProfileImage)
);

moduleRouter.get(
  "/videos",
  asyncHandler(auth.passportJwt),
  asyncHandler(user.getVideos)
);

module.exports = {
  moduleRouter,
  config,
};
