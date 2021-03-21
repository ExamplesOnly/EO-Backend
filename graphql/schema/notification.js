const notificationController = require("../../controllers/graphql/notification");

exports.typeDef = `
  extend type Query {
    Notifications(limit: Int, offset: Int): [Notification!]!
  }

  type Notification {
    text: String
    type: String
    thumb: String!
    actionType: String
    actionId: String!
    createdAt: String
  }
`;

exports.resolvers = {
  Query: {
    async Notifications(parent, args, context, info) {
      let notifications = await notificationController.getNotifications(
        args.limit,
        args.offset,
        context.user
      );
      return notifications;
    },
  },
};
