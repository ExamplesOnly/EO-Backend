const ExampleDemand = require("../models").ExampleDemand;
const NotifyFollow = require("../models").NotifyFollow;
const Notification = require("../models").Notification;
const UserSession = require("../models").UserSession;
const UserFollow = require("../models").UserFollow;
const NotifyBow = require("../models").NotifyBow;
const Video = require("../models").Video;
const User = require("../models").User;
const { Sequelize, sequelize } = require("../models");
const firebaseAdmin = require("../config/firebase");
const notificationTemplate = require("../static/notification");
const constants = require("../utils/constants");

exports.bowNotification = async (req, res, next) => {
  let { bow, isAdded } = req.notificationData;
  var bowedVideo;

  const t = await sequelize.transaction();
  try {
    // If new notification is created
    if (isAdded) {
      /** Video data is needed to extract the
       * corosponding user Id.
       * */
      bowedVideo = await Video.findOne({
        where: {
          id: bow.videoId,
        },
      });

      // If the owner of the video like his own video
      // then skip notification generation
      if (bowedVideo.userId == req.user.id) return;

      const bowNotfication = await NotifyBow.create(
        {
          videoId: bow.videoId,
          bowId: bow.id,
          bowByUserId: bow.userId,
        },
        { transaction: t }
      );

      await bowNotfication.createNotification(
        {
          notificationForUserId: bowedVideo.userId,
          actionByUserId: bow.userId,
        },
        { transaction: t }
      );

      // If bow is removed, remove the notification as well
    } else {
      const bowNotfication = await NotifyBow.findOne({
        where: {
          videoId: bow.videoId,
          bowByUserId: bow.userId,
        },
      });

      if (bowNotfication) {
        await bowNotfication.destroy();
        await Notification.destroy(
          {
            where: {
              typeId: bowNotfication.id,
            },
          },
          { transaction: t }
        );
      }
    }

    await t.commit();

    // If new notification is created then send notification
    if (isAdded) {
      let currVideo = await Video.findOne({
        where: {
          id: bow.videoId,
        },
        include: [
          {
            model: ExampleDemand,
          },
        ],
        attributes: ["videoId", "thumbUrl", "title"],
      });

      let payload = {
        videoTitle: currVideo.ExampleDemand
          ? currVideo.ExampleDemand.title
          : currVideo.title,
        userFullName: req.user.firstName,
        userprofileImage: req.user.profileImage,
        actionType: constants.NOTIFICATION_ACTION_VIDEO,
        actionId: currVideo.videoId,
      };

      // build the notification payload to attach additional data required for UI
      let finalPayload = buildNotification(constants.NOTIFICATION_BOW, payload);
      if (finalPayload) {
        // Send notification
        pushNotification(bowedVideo.userId, finalPayload);
      }
    }
    return;
  } catch (error) {
    await t.rollback();
    return;
  }
};

exports.followNotification = async (req, res, next) => {
  let { follow, isFollowed } = req.notificationData;
  let followData;

  const t = await sequelize.transaction();
  try {
    // If user followed
    if (isFollowed) {
      // Extract users data from UserFollow data
      followData = await UserFollow.findOne({
        where: {
          uuid: follow.dataValues.uuid,
        },
        include: [
          {
            model: User,
            as: "following",
          },
          {
            model: User,
            as: "follower",
          },
        ],
      });

      // create the notification entry
      const followNotfication = await NotifyFollow.create(
        {
          followId: follow.dataValues.uuid,
          followByUserId: follow.dataValues.followerUuid,
        },
        { transaction: t }
      );

      await followNotfication.createNotification(
        {
          notificationForUserId: followData.following.id,
          actionByUserId: followData.follower.dataValues.id,
        },
        { transaction: t }
      );

      // Commit changes to the database
      await t.commit();

      let payload = {
        userFullName: req.user.firstName,
        userprofileImage: req.user.profileImage,
        actionType: constants.NOTIFICATION_ACTION_PROFILE,
        actionId: req.user.uuid,
      };

      // build the notification payload to attach additional data required for UI
      let finalPayload = buildNotification(
        constants.NOTIFICATION_FOLLOW,
        payload
      );
      if (finalPayload) {
        // Send notification
        pushNotification(followData.following.id, finalPayload);
      }

      // If user unfollowed, remove the notification
    } else {
      const followNotfication = await NotifyFollow.findOne({
        where: {
          followId: follow.dataValues.uuid,
        },
      });
      if (followNotfication) {
        await followNotfication.destroy();
        await Notification.destroy(
          {
            where: {
              typeId: followNotfication.id,
            },
          },
          { transaction: t }
        );
      }

      // Commit changes to the database
      await t.commit();
    }
  } catch (e) {
    console.log("followNotification: rollback");

    console.log(e);
    await t.rollback();
    return;
  }
};

function buildNotification(type, payload) {
  switch (type) {
    case constants.NOTIFICATION_BOW:
      var notificationText = notificationTemplate.bowPush
        .replace(/{{name}}/gm, payload.userFullName)
        .replace(/{{video_title}}/gm, payload.videoTitle);
      var finalPayload = {
        notificationText,
        notificationType: constants.NOTIFICATION_BOW,
        notificationThumb: payload.userprofileImage,
        actionType: payload.actionType,
        actionId: payload.actionId,
      };
      return finalPayload;
    case constants.NOTIFICATION_FOLLOW:
      var notificationText = notificationTemplate.followPush.replace(
        /{{name}}/gm,
        payload.userFullName
      );
      var finalPayload = {
        notificationText,
        notificationType: constants.NOTIFICATION_FOLLOW,
        notificationThumb: payload.userprofileImage,
        actionType: payload.actionType,
        actionId: payload.actionId,
      };
      return finalPayload;
    default:
      return null;
  }
}

async function pushNotification(userId, data) {
  var tokens = [];

  // Get destination user's all sessions to get
  // FCM tokens of the user
  var userSessions = await UserSession.findAll({
    where: {
      userId: userId,
    },
  });

  userSessions.forEach((s) => {
    if (typeof s.fcmToken === "string" || s.fcmToken instanceof String) {
      tokens.push(s.fcmToken);
    }
  });

  // If no tokens are available, stip push notification process
  if (tokens.length < 1) return;

  var message = {
    data,
    tokens,
  };

  firebaseAdmin
    .messaging()
    .sendMulticast(message)
    .then((response) => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
}
