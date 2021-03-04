("use strict");

const { signUrl } = require("../config/media");

const thirtyMins = 30 * 60 * 1000;
const sevenDays = 7 * 24 * 60 * 60 * 1000;

const mediaCdnHost = process.env.AWS_CLOUFRONT_MEDIA_HOST
  ? process.env.AWS_CLOUFRONT_MEDIA_HOST
  : "mediacdn.examplesonly.com";

console.log(process.env.AWS_CLOUFRONT_MEDIA_HOST);

module.exports = (sequelize, DataTypes) => {
  const Video = sequelize.define(
    "Video",
    {
      videoId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      size: DataTypes.INTEGER,
      duration: DataTypes.INTEGER,
      height: DataTypes.INTEGER,
      width: DataTypes.INTEGER,
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      url: {
        type: DataTypes.VIRTUAL,
        get() {
          return process.env.NODE_ENV == "production"
            ? signUrl(mediaCdnHost, this.fileKey, thirtyMins)
            : `https://${mediaCdnHost}/${this.fileKey}`;
        },
      },
      thumbUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          return process.env.NODE_ENV == "production"
            ? signUrl(mediaCdnHost, this.thumbKey, sevenDays)
            : `https://${mediaCdnHost}/${this.fileKey}`;
        },
      },
      fileKey: DataTypes.STRING,
      thumbKey: DataTypes.STRING,
      uploadedAtLat: DataTypes.STRING,
      uploadedAtLong: DataTypes.STRING,
    },
    {}
  );
  Video.associate = function (models) {
    Video.hasOne(models.VideoMeta, {
      foreignKey: "videoId",
      as: "videoMeta"
    });

    Video.belongsTo(models.User, {
      foreignKey: "userId",
    });

    Video.hasMany(models.VideoBookmark, {
      foreignKey: "videoId",
    });

    Video.belongsTo(models.ExampleDemand, {
      foreignKey: "demandId",
    });

    Video.belongsToMany(models.Category, {
      foreignKey: "videoId",
      through: "VideoCategory",
    });

    Video.belongsToMany(models.User, {
      through: {
        model: models.VideoView,
        foreignKey: "videoId",
        unique: false,
      },
    });

    Video.hasMany(models.VideoView, {
      foreignKey: "videoId",
    });

    Video.belongsToMany(models.User, {
      foreignKey: "videoId",
      through: "VideoBow",
    });

    Video.hasMany(models.VideoBow, {
      foreignKey: "videoId",
    });

    Video.hasMany(models.VideoReach, {
      foreignKey: "videoId",
    });

    Video.hasMany(models.VideoPlayTime, {
      foreignKey: "videoId",
    });

    Video.hasMany(models.VideoReport, {
      foreignKey: "videoId",
    });

    Video.hasOne(models.VideoGlobalTrending, {
      foreignKey: "videoId",
    });

    Video.hasOne(models.VideoCategoryTrending, {
      foreignKey: "categoryId",
    });
  };
  return Video;
};
