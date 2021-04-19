const ExampleDemand = require("../../models").ExampleDemand;
const Notification = require("../../models/").Notification;
const NotifyBow = require("../../models/").NotifyBow;
const NotifyFollow = require("../../models/").NotifyFollow;
const User = require("../../models/").User;
const Video = require("../../models/").Video;

const notificationTemplate = require("../../static/notification");
const constants = require("../../utils/constants");

exports.getNotifications = async (limit = 20, offset = 0, user) => {
  try {
    var notifications = await Notification.findAll({
      where: {
        notificationForUserId: user.id,
      },
      include: [
        { model: NotifyBow, include: [{ model: User }] },
        { model: NotifyFollow, include: [{ model: User }] },
      ],
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
    });
    var notificaionData = notifications.map((n) => transformNotification(n));
    return notificaionData;
  } catch (err) {
    throw err;
  }
};

async function transformNotification(data) {
  switch (data.type) {
    case "NotifyBow":
      console.log("NotifyBow", data);
      // Get the associated video of the bow
      let videoData = await Video.findOne({
        where: {
          id: data.typeData.videoId,
        },
        include: [
          {
            model: ExampleDemand,
          },
        ],
        attributes: ["videoId", "title"],
      });
      var notificationText = notificationTemplate.bow
        .replace(/{{name}}/gm, data.typeData.User.firstName)
        .replace(
          /{{video_title}}/gm,
          videoData.ExampleDemand
            ? videoData.ExampleDemand.title
            : videoData.title
        );
      var finalPayload = {
        uuid: data.uuid,
        text: notificationText,
        type: constants.NOTIFICATION_BOW,
        thumb: data.typeData.User.profileImage,
        actionType: constants.NOTIFICATION_ACTION_VIDEO,
        actionId: videoData.videoId,
        createdAt: data.createdAt,
      };
      return finalPayload;
    case "NotifyFollow":
      // Get the associated "following" user
      var userData = data.typeData.User;

      var notificationText = notificationTemplate.follow.replace(
        /{{name}}/gm,
        userData.firstName
      );
      var finalPayload = {
        uuid: data.uuid,
        text: notificationText,
        type: constants.NOTIFICATION_FOLLOW,
        thumb: userData.profileImage,
        actionType: constants.NOTIFICATION_ACTION_PROFILE,
        actionId: userData.uuid,
        createdAt: data.createdAt,
      };
      return finalPayload;
      break;
    default:
      break;
  }
  return data;
}
