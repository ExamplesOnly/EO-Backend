const DataLoader = require("dataloader");

const Video = require("../../models").Video;
const VideoMeta = require("../../models").VideoMeta;
const ExampleDemand = require("../../models").ExampleDemand;
const VideoGlobalTrending = require("../../models").VideoGlobalTrending;

const userController = require("./user");

exports.videoLoader = new DataLoader((videoIds) => {
  let videoList = Video.findOne({
    where: {
      videoId: {
        [Op.in]: videoIds,
      },
    },
    include: [
      {
        model: VideoMeta,
        as: "videoMeta",
      },
    ],
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
    return video ? video : null;
  } catch (err) {
    throw err;
  }
};

exports.getFeedList = async (limit = 20, offset = 0) => {
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
      let isDemand = v.ExampleDemand ? true : false;

      return this.transformVideo({
        ...v.dataValues,
        title,
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
  console.log("getTrendingList STRT");
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

      let isDemand = v.Video.ExampleDemand ? true : false;

      return this.transformVideo({
        ...v.Video.dataValues,
        title,
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

exports.transformVideo = async (video) => {
  // userController.getUserById.bind(this, video.userId)
  let user = await userController.getUserById(video.userId);
  return {
    ...video,
    publisher: user,
  };
};
