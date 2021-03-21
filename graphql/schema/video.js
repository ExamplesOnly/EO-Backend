module.exports = `
  extend type Query {
    Video(videoId: String): Video
    Feed(limit: Int, offset: Int): [Video!]!
    TrendingFeed(limit: Int, offset: Int): [Video!]!
    getCategoryVideo(categories: String!, limit: Int, offset: Int): [Video!]
  }

  type Video {
    videoId: String!
    size: Int!
    duration: Int!
    height: Int!
    width: Int!
    title: String!
    description: String!
    url: String!
    thumbUrl: String!
    bow: Int
    view: Int
    userBowed: Boolean
    userBookmarked: Boolean
    isDemand: Boolean
    publisher: User!
  }
`;
