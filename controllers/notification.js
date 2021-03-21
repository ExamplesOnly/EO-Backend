const Notification = require("../models").Notification;
const NotifyBow = require("../models").NotifyBow;
const User = require("../models").User;
const Video = require("../models").Video;
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
        attributes: ["videoId", "thumbUrl", "title"],
      });

      let payload = {
        videoTitle: currVideo.title,
        userFullName: req.user.firstName,
        userprofileImage: req.user.profileImage,
        actionType: constants.NOTIFICATION_ACTION_VIDEO,
        actionId: currVideo.videoId,
      };

      // build the notification payload to attach additional data required for UI
      let finalPayload = buildNotification(constants.NOTIFICATION_BOW, payload);
      if (finalPayload) pushNotification(finalPayload, null);
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
  var message = {
    data,
    token:
      "eBTmzUSqRJeS7LUSshs2gL:APA91bFVmh2GGRlS1K0AfoPfbJXB46aWLbO4HyDtrSKz0URW2OudAXqRU0I0quoLoXXwgGaqNiCT8g6o6Htw6llUSVbSR7SDlhH2I7OFbk13XbhZ2cQu8KUqKRPh4XYOmyDZlnynhnzC",
  };

  firebaseAdmin
    .messaging()
    .send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
}
