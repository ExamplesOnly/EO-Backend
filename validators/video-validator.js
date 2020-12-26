let { body, param, check } = require("express-validator");
const Video = require("../models").Video;
const User = require("../models").User;
const VideoView = require("../models").VideoView;

exports.postViewBow = [
  body("videoId", "Video ID is required.")
    .exists({ checkNull: true })
    .withMessage("Video ID is required.")
    .custom(async (value, { req }) => {
      const video = await Video.findOne({
        where: { videoId: req.body.videoId },
      });

      if (!video) {
        return Promise.reject();
      }

      req.video = video;
    })
    .withMessage("Video not found."),
  body("userId", "User is not valid.")
    .exists({ checkNull: true })
    .withMessage("User ID is required.")
    .custom(async (value, { req }) => {
      const user = await User.findOne({
        where: { uuid: req.body.userId },
      });

      if (!user) {
        return Promise.reject();
      }

      req.bowUser = user;
    })
    .withMessage("User not found.")
    .custom(async (value, { req }) => {
      if (req.bowUser.uuid != req.user.uuid) return Promise.reject();
    })
    .withMessage("You are not allowed to perform this action"),
];

exports.postPlayTime = [
  body("videoId", "Video ID is required.")
    .exists({ checkNull: true })
    .withMessage("Video ID is required.")
    .custom(async (value, { req }) => {
      const video = await Video.findOne({
        where: { videoId: req.body.videoId },
      });

      if (!video) {
        return Promise.reject();
      }

      req.video = video;
    })
    .withMessage("Video not found."),
  body("userId", "User is not valid.")
    .exists({ checkNull: true })
    .withMessage("Video ID is required.")
    .custom(async (value, { req }) => {
      const user = await User.findOne({
        where: { uuid: req.body.userId },
      });

      if (!user) {
        return Promise.reject();
      }

      req.bowUser = user;
    })
    .withMessage("User not found.")
    .custom(async (value, { req }) => {
      if (req.bowUser.uuid != req.user.uuid) return Promise.reject();
    })
    .withMessage("You are not allowed to perform this action."),
  body("viewId", "View ID is required.")
    .exists({ checkNull: true })
    .withMessage("View ID is required.")
    .custom(async (value, { req }) => {
      const view = await VideoView.findOne({
        where: { uuid: req.body.viewId },
      });

      if (!view) {
        return Promise.reject();
      }
    })
    .withMessage("Invalid View ID"),
  body("playTime", "Play time is required.")
    .exists({ checkNull: true })
    .withMessage("View ID is required.")
    .isNumeric()
    .withMessage("Play Time must be an integer."),
];

exports.postBookmark = [
  body("videoId", "Video ID is required.")
    .exists({ checkNull: true })
    .withMessage("Video ID is required.")
    .custom(async (value, { req }) => {
      const video = await Video.findOne({
        where: { videoId: req.body.videoId },
        attributes: ["id", "videoId"],
      });

      if (!video) {
        return Promise.reject();
      }

      req.video = video;
    })
    .withMessage("Video not found."),
];
