const express = require("express");
const asyncHandler = require("express-async-handler");
const auth = require("../controllers/auth");
const user = require("../controllers/user");
const validator = require("../controllers/validator");
const userValidator = require("../validators/user-validator");
const helper = require("../controllers/helper");
const { uploads3 } = require("../config/media");
const notification = require("../controllers/notification");

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
  asyncHandler(auth.passportJwt),
  uploads3.single("file"),
  asyncHandler(user.uploadProfileImage)
);

moduleRouter.post(
  "/update/coverImage",
  asyncHandler(auth.passportJwt),
  uploads3.single("file"),
  asyncHandler(user.uploadCoverImage)
);

moduleRouter.post(
  "/update/profile",
  asyncHandler(auth.passportJwt),
  validator.updateProfile,
  asyncHandler(helper.verify),
  asyncHandler(user.updateProfile)
);

moduleRouter.get(
  "/videos",
  asyncHandler(auth.passportJwt),
  asyncHandler(user.getVideos)
);

moduleRouter.get(
  "/interests",
  asyncHandler(auth.passportJwt),
  asyncHandler(user.getInterest)
);

moduleRouter.get(
  "/myDemands",
  asyncHandler(auth.passportJwt),
  asyncHandler(user.getUserDemands)
);

moduleRouter.get(
  "/myDemandBookmarks",
  asyncHandler(auth.passportJwt),
  asyncHandler(user.getDemandsBookmarks)
);

moduleRouter.get(
  "/getProfile/:uuid",
  asyncHandler(auth.passportJwt),
  asyncHandler(user.getUserProfile)
);

moduleRouter.get(
  "/myVideoBookmarks",
  asyncHandler(auth.passportJwt),
  asyncHandler(user.getVideoBookmarks)
);

moduleRouter.post(
  "/follow",
  asyncHandler(auth.passportJwt),
  userValidator.follow,
  asyncHandler(helper.verify),
  asyncHandler(user.followUser),
  asyncHandler(notification.followNotification)
);

moduleRouter.post(
  "/unfollow",
  asyncHandler(auth.passportJwt),
  userValidator.follow,
  asyncHandler(helper.verify),
  asyncHandler(user.unfollowUser),
  asyncHandler(notification.followNotification)
);

moduleRouter.get(
  "/followers/:uuid",
  asyncHandler(auth.passportJwt),
  asyncHandler(helper.pagination),
  asyncHandler(user.getFollowers)
);

moduleRouter.get(
  "/followings/:uuid",
  asyncHandler(auth.passportJwt),
  asyncHandler(helper.pagination),
  asyncHandler(user.getFollowings)
);

moduleRouter.post(
  "/updateFcmToken",
  asyncHandler(auth.passportJwt),
  userValidator.updateFcmToken,
  asyncHandler(helper.verify),
  asyncHandler(user.updateFcmToken)
);

module.exports = {
  moduleRouter,
  config,
};
