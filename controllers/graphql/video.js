const DataLoader = require("dataloader");

const Video = require("../../models").Video;
const VideoMeta = require("../../models").VideoMeta;
const ExampleDemand = require("../../models").ExampleDemand;

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

    console.log("getFeedList 1", videoList);

    let videoFeed = videoList.map((v) => {
    console.log("getFeedList 2", v, v.videoMeta, v.videoMeta.bow);
      return this.transformVideo({
        ...v.dataValues,
        url: v.url,
        thumbUrl: v.thumbUrl,
        bow: v.videoMeta.bow,
        view: v.videoMeta.view,
      });
    });

    return videoFeed ? videoFeed : null;
  } catch (err) {
    throw err;
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
