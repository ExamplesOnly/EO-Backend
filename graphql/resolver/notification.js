const notificationController = require("../../controllers/graphql/notification");

module.exports = {
  Query: {
    async Notifications(parent, { limit, offset }, { user }, info) {
      let notifications = await notificationController.getNotifications(
        limit,
        offset,
        user
      );
      return notifications;
    },
  },
  // Mutation: {
  //   async updateFcmToken(_, { refreshToken, fcmToken }, context) {},
  // },
};
