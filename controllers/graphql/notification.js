const Notification = require("../../models/").Notification;
const NotifyBow = require("../../models/").NotifyBow;
const User = require("../../models/").User;
const Video = require("../../models/").Video;

const notificationTemplate = require("../../static/notification");
const constants = require("../../utils/constants");

exports.getNotifications = async (limit = 20, offset = 0) => {
  try {
    var notifications = await Notification.findAll({
      include: [{ model: NotifyBow, include: [{ model: User }] }],
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
      // Get the associated video of the bow
      let videoData = await Video.findOne({
        where: {
          id: data.typeData.videoId,
        },
        attributes: ["videoId", "title"],
      });
      var notificationText = notificationTemplate.bow
        .replace(/{{name}}/gm, data.typeData.User.firstName)
        .replace(/{{video_title}}/gm, videoData.title);
      let finalPayload = {
        uuid: data.uuid,
        text: notificationText,
        type: constants.NOTIFICATION_BOW,
        thumb: data.typeData.User.profileImage,
        actionType: constants.NOTIFICATION_ACTION_VIDEO,
        actionId: videoData.videoId,
        createdAt: data.createdAt,
      };
      return finalPayload;

    default:
      break;
  }
  return data;
}
