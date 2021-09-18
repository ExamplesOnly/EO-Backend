const { Sequelize } = require("../../models");
const User = require("../../models").User;
const Video = require("../../models").Video;
const VideoMeta = require("../../models").VideoMeta;
const ExampleDemand = require("../../models").ExampleDemand;

const { transformVideo, videoLoader } = require("./video");

exports.searchAll = async (query, limit = 20, offset = 0) => {
  var queryTimeStamp = Date.now();

  try {
    // Get video list according to search query
    let videoList = await Video.findAll({
      where: {
        [Sequelize.Op.or]: [
          {
            title: {
              [Sequelize.Op.substring]: query,
            },
          },
          {
            description: {
              [Sequelize.Op.substring]: query,
            },
          },
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
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
    });

    // process videos
    let videos = videoList.map((v) => {
      let title = v.ExampleDemand ? v.ExampleDemand.title : v.title;
      let description = v.ExampleDemand
        ? v.ExampleDemand.description
        : v.description
        ? v.description
        : "";

      let isDemand = v.ExampleDemand ? true : false;

      return transformVideo({
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

    return {
      query,
      queryTimeStamp,
      users: [],
      videos,
    };
  } catch (e) {
    return {
      query,
      queryTimeStamp,
      users: [],
      videos: [],
    };
  }
};

exports.SearchUser = async (query, limit = 20, offset = 0) => {
  var queryTimeStamp = Date.now();

  try {
    // Get video list according to search query
    let userList = await User.findAll({
      where: {
        [Sequelize.Op.or]: [
          {
            firstName: {
              [Sequelize.Op.substring]: query,
            },
          },
          {
            middleName: {
              [Sequelize.Op.substring]: query,
            },
          },
          {
            lastName: {
              [Sequelize.Op.substring]: query,
            },
          },
        ],
      },
      //  order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
    });

    return {
      query,
      queryTimeStamp,
      users: userList,
    };
  } catch (e) {
    return {
      query,
      queryTimeStamp,
      users: [],
    };
  }
};

exports.SearchVideo = async (query, limit = 20, offset = 0) => {
  var queryTimeStamp = Date.now();

  try {
    // Get video list according to search query
    let videoList = await Video.findAll({
      where: {
        [Sequelize.Op.or]: [
          {
            title: {
              [Sequelize.Op.substring]: query,
            },
          },
          {
            description: {
              [Sequelize.Op.substring]: query,
            },
          },
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
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
    });

    // process videos
    let videos = videoList.map((v) => {
      let title = v.ExampleDemand ? v.ExampleDemand.title : v.title;
      let description = v.ExampleDemand
        ? v.ExampleDemand.description
        : v.description
        ? v.description
        : "";

      let isDemand = v.ExampleDemand ? true : false;

      return transformVideo({
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

    return {
      query,
      queryTimeStamp,
      videos,
    };
  } catch (e) {
    return {
      query,
      queryTimeStamp,
      videos: [],
    };
  }
};
