const Notification = require("../models").Notification;
const NotifyBow = require("../models").NotifyBow;
const User = require("../models").User;
const Video = require("../models").Video;
const UserSession = require("../models").UserSession;
const ExampleDemand = require("../models").ExampleDemand;
const { sequelize } = require("../models");
const firebaseAdmin = require("../config/firebase");
const notificationTemplate = require("../static/notification");
const constants = require("../utils/constants");

exports.bowNotification = async (req, res, next) => {
  console.log("IN bowNotification 1");

  let { bow, isAdded } = req.notificationData;

  const t = await sequelize.transaction();
  try {
    // If new notification is created
    if (isAdded) {
      /** Video data is needed to extract the
       * corosponding user Id.
       * */
      const bowedVideo = await Video.findOne({
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

      // If notification is deleted
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
        // get all the sessions of the
        var userSessions = await UserSession.findAll({
          where: {
            userId: bowedVideo.userId,
          },
        });

        var tokens = [];
        userSessions.forEach((s) => {
          if (typeof s.fcmToken === "string" || s.fcmToken instanceof String) {
            tokens.push(s.fcmToken);
          }
        });

        // Send notification only if user has atleast one FCM token
        if (tokens.length > 0) pushNotification(finalPayload, tokens);
      }
    }
    return;
  } catch (error) {
    console.log(error);
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
      let finalPayload = {
        notificationText,
        notificationType: constants.NOTIFICATION_BOW,
        notificationThumb: payload.userprofileImage,
        actionType: payload.actionType,
        actionId: payload.actionId,
      };
      return finalPayload;
    default:
      return null;
  }
}

function pushNotification(data, tokens) {
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
