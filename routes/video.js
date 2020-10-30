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
  // validator.upload,
  // asyncHandler(helper.verify),
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
  asyncHandler(video.saveVideo)
);

moduleRouter.get(
  "/list",
  asyncHandler(auth.passportJwt),
  asyncHandler(video.getVideos)
);

module.exports = {
  moduleRouter,
  config,
};
