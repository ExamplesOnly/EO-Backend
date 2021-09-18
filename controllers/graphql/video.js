const DataLoader = require("dataloader");

const Video = require("../../models").Video;
const VideoMeta = require("../../models").VideoMeta;
const ExampleDemand = require("../../models").ExampleDemand;
const VideoGlobalTrending = require("../../models").VideoGlobalTrending;

const userController = require("./user");

const { ApolloError } = require("apollo-server");

exports.videoLoader = new DataLoader((videoIds) => {
  let videoList = Video.findAll({
    where: {
      videoId: {
        [Op.in]: videoIds,
      },
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
    order: [[sequelize.fn("field", sequelize.col("id"), userids)]],
  });

  let videoFeed = videoList.map((v) => {
    return this.transformVideo({
      ...v.dataValues,
      url: v.url,
      thumbUrl: v.thumbUrl,
      bow: v.videoMeta.bow,
      view: v.videoMeta.view,
    });
  });

  return videoFeed ? videoFeed : null;
});

exports.getVideo = async (videoId) => {
  try {
    let video = await this.videoLoader.load(videoId);

    if (!video) throw new ApolloError("Video not found");

    let title = v.ExampleDemand ? v.ExampleDemand.title : v.title;
    let description = v.ExampleDemand
      ? v.ExampleDemand.description
      : v.description
      ? v.description
      : "";

    let isDemand = v.ExampleDemand ? true : false;

    return this.transformVideo({
      ...video.dataValues,
      title,
      description,
      isDemand,
      url: video.url,
      thumbUrl: video.thumbUrl,
      bow: video.videoMeta.bow,
      view: video.videoMeta.view,
    });
  } catch (err) {
    throw err;
  }
};

exports.getFeedList = async (limit = 20, offset = 0, fields) => {
  try {
    let videoList = await Video.findAll({
      include: [
        {
          model: ExampleDemand,
        },
        {
          model: VideoMeta,
          as: "videoMeta",
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
    });

    let videoFeed = videoList.map((v) => {
      let title = v.ExampleDemand ? v.ExampleDemand.title : v.title;
      let description = v.ExampleDemand
        ? v.ExampleDemand.description
        : v.description
        ? v.description
        : "";

      let isDemand = v.ExampleDemand ? true : false;

      return this.transformVideo({
        ...v.dataValues,
        title,
        description,
        isDemand,
        url: v.url,
        thumbUrl: v.thumbUrl,
        bow: v.videoMeta.bow,
        view: v.videoMeta.view,
      });
    });

    return videoFeed ? videoFeed : null;
  } catch (err) {
    return [];
  }
};

exports.getTrendingList = async (limit = 20, offset = 0) => {
  try {
    let videoList = await VideoGlobalTrending.findAll({
      include: [
        {
          model: Video,
          include: [
            {
              model: ExampleDemand,
            },
            {
              model: VideoMeta,
              as: "videoMeta",
            },
          ],
        },
      ],
      order: [["trendingRank", "ASC"]],
      limit: limit,
      offset: offset,
    });

    let videoFeed = videoList.map((v) => {
      let title = v.Video.ExampleDemand
        ? v.Video.ExampleDemand.title
        : v.Video.title;
      let description = v.Video.ExampleDemand
        ? v.Video.ExampleDemand.description
        : v.Video.description
        ? v.Video.description
        : "";

      let isDemand = v.Video.ExampleDemand ? true : false;

      return this.transformVideo({
        ...v.Video.dataValues,
        title,
        description,
        isDemand,
        url: v.Video.url,
        thumbUrl: v.Video.thumbUrl,
        bow: v.Video.videoMeta.bow,
        view: v.Video.videoMeta.view,
      });
    });

    return videoFeed ? videoFeed : null;
  } catch (error) {
    return [];
  }
};

/**
 * This mentod is used to get videos of a specific user
 *
 * @param {number} userId The id of the user
 * @param {number} limit Query limit
 * @param {number} offset Query offset
 * @returns List of videos of the specified user
 */
exports.getVideoByUser = async (userId, limit = 20, offset = 0) => {
  try {
    let videoList = await Video.findAll({
      where: {
        id: userId,
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
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
    });

    let videoFeed = videoList.map((v) => {
      let title = v.ExampleDemand ? v.ExampleDemand.title : v.title;
      let description = v.ExampleDemand
        ? v.ExampleDemand.description
        : v.description
        ? v.description
        : "";

      let isDemand = v.ExampleDemand ? true : false;

      return this.transformVideo({
        ...v.dataValues,
        title,
        description,
        isDemand,
        url: v.url,
        thumbUrl: v.thumbUrl,
        bow: v.videoMeta.bow,
        view: v.videoMeta.view,
      });
    });

    return videoFeed ? videoFeed : null;
  } catch (err) {
    return [];
  }
};

exports.transformVideo = async (video) => {
  // userController.getUserById.bind(this, video.userId)
  let user = await userController.getUserById(video.userId);
  return {
    ...video,
    publisher: user,
  };
};
