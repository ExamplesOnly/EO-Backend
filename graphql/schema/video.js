const Video = require("../../models").Video;
const ExampleDemand = require("../../models").ExampleDemand;
const VideoMeta = require("../../models").VideoMeta;

const { sequelize } = require("../../models");
const { QueryTypes } = require("sequelize");
const { ApolloError } = require("apollo-server");

const videoController = require("../../controllers/graphql/video");

exports.typeDef = `
  extend type Query {
    getVideo(videoId: String): Video
    getFeed(limit: Int, offset: Int): [Video!]
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
    publisher: User
  }
`;

exports.resolvers = {
  Query: {
    async getVideo(parent, args, context, info) {
      console.log("getVideo", context);
      let video = await Video.findOne({
        where: { videoId: args.videoId },
        attributes: {
          include: [
            [
              sequelize.literal(
                `(SELECT COUNT(*) FROM VideoBows WHERE videoId=Video.id AND userId=${context.user.id})`
              ),
              "userBowed",
            ],
            [
              sequelize.literal(
                `(SELECT COUNT(*) FROM VideoBookmarks WHERE videoId=Video.id AND userId=${context.user.id})`
              ),
              "userBookmarked",
            ],
          ],
        },
        include: [
          {
            model: ExampleDemand,
          },
          {
            model: VideoMeta,
            as: "videoMeta",
          },
        ],
      });

      if (!video) return new ApolloError("Video not found");

      return videoController.transformVideo({
        ...video.dataValues,
        url: video.url,
        thumbUrl: video.thumbUrl,
        bow: video.videoMeta.bow,
        view: video.videoMeta.view,
      });
    },
    async getFeed(parent, args, context, info) {
      let videoList = await videoController.getFeedList(
        args.limit,
        args.offset
      );
      return videoList;
    },
    async getCategoryVideo(arent, args, context, info) {},
  },
};
