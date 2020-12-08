const express = require("express");
const asyncHandler = require("express-async-handler");
const validator = require("../controllers/validator");
const video = require("../controllers/video");
const auth = require("../controllers/auth");
const helper = require("../controllers/helper");

const moduleRouter = express.Router();

const config = {
  name: "public",
  parentRoute: "/video",
};

moduleRouter.post(
  "/upload",
  asyncHandler(auth.passportJwt),
  asyncHandler(video.setupVideo),
  video.uploadS3.fields([
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

module.exports = {
  moduleRouter,
  config,
};
