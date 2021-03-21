module.exports = `
  extend type Query {
    Notifications(limit: Int, offset: Int): [Notification!]!
  }
  type Mutation {
    updateFcmToken(refreshToken: String, fcmToken: String): [Notification!]!
  }

  type Notification {
    uuid: String
    text: String
    type: String
    thumb: String!
    actionType: String
    actionId: String!
    createdAt: String
  }
`;
