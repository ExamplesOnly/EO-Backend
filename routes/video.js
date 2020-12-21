const express = require("express");
const asyncHandler = require("express-async-handler");
const validator = require("../controllers/validator");
const videoValidator = require("../validators/video-validator");
const helper = require("../controllers/helper");
const video = require("../controllers/video");
const auth = require("../controllers/auth");

const moduleRouter = express.Router();

const config = {
  name: "public",
  parentRoute: "/video",
};

moduleRouter.post(
  "/upload",
  asyncHandler(auth.passportJwt),
  asyncHandler(video.setupVideo),
  video.uploadVideo.fields([
    {
      name: "file",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  // validator.upload,
  // asyncHandler(helper.verify),
  asyncHandler(video.saveVideo)
);

moduleRouter.get(
  "/list",
  asyncHandler(auth.passportJwt),
  asyncHandler(video.getVideos)
);

moduleRouter.post(
  "/delete",
  asyncHandler(auth.passportJwt),
  asyncHandler(video.deleteVideo)
);

moduleRouter.get(
  "/:uuid",
  asyncHandler(auth.passportJwt),
  asyncHandler(video.getVideo)
);

moduleRouter.post(
  "/postReach",
  asyncHandler(auth.passportJwt),
  videoValidator.postViewBow,
  asyncHandler(helper.verify),
  asyncHandler(video.postReach)
);

moduleRouter.post(
  "/postView",
  asyncHandler(auth.passportJwt),
  videoValidator.postViewBow,
  asyncHandler(helper.verify),
  asyncHandler(video.postView)
);

moduleRouter.post(
  "/postPlayTime",
  asyncHandler(auth.passportJwt),
  videoValidator.postViewBow,
  asyncHandler(helper.verify),
  asyncHandler(video.postPlayTime)
);

moduleRouter.post(
  "/postBow",
  asyncHandler(auth.passportJwt),
  videoValidator.postViewBow,
  asyncHandler(helper.verify),
  asyncHandler(video.postBow)
);

module.exports = {
  moduleRouter,
  config,
};
