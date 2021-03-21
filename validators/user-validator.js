let { body, param, check } = require("express-validator");
const Video = require("../models").Video;
const User = require("../models").User;
const UserFollow = require("../models").UserFollow;

exports.follow = [
  body("uuid", "Invalid Request.")
    .exists({ checkNull: true })
    .withMessage("Invalid Request.")
    .custom(async (value, { req }) => {
      if (req.body.uuid == req.user.uuid) return Promise.reject();

      const user = await User.findOne({
        where: { uuid: req.body.uuid },
      });

      if (!user) {
        return Promise.reject();
      }

      req.followUser = user;
    })
    .withMessage("Invalid Request."),
];

exports.updateFcmToken = [
  body("refreshToken", "Invalid Request.")
    .exists({ checkNull: true })
    .withMessage("Invalid Request."),
  body("fcmToken", "Invalid Request.")
    .exists({ checkNull: true })
    .withMessage("Invalid Request."),
];
