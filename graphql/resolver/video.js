const Video = require("../../models").Video;
const ExampleDemand = require("../../models").ExampleDemand;
const VideoMeta = require("../../models").VideoMeta;

const { sequelize } = require("../../models");
const { ApolloError } = require("apollo-server");

const videoController = require("../../controllers/graphql/video");

module.exports = {
  Query: {
    async Video(parent, args, context, info) {
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
    async Feed(parent, args, context, info) {
      let videoList = await videoController.getFeedList(
        args.limit,
        args.offset
      );
      return videoList;
    },
    async TrendingFeed(parent, args, context, info) {
      let videoList = await videoController.getTrendingList(
        args.limit,
        args.offset
      );
      return videoList;
    },
    async getCategoryVideo(arent, args, context, info) {},
  },
};
