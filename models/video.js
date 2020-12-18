("use strict");

const { signUrl } = require("../config/media");

const thirtyMins = 30 * 60 * 1000;
const sevenDays = 7 * 24 * 60 * 60 * 1000;

const mediaCdnHost = process.env.AWS_CLOUFRONT_MEDIA_HOST
  ? process.env.AWS_CLOUFRONT_MEDIA_HOST
  : "mediacdn.examplesonly.com";

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
          return signUrl(mediaCdnHost, this.fileKey, thirtyMins);
        },
      },
      thumbUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          return signUrl(mediaCdnHost, this.thumbKey, sevenDays);
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
    Video.belongsTo(models.User, {
      foreignKey: "userId",
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
  };
  return Video;
};
