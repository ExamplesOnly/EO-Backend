"use strict";
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
      url: DataTypes.STRING,
      thumbUrl: DataTypes.STRING,
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
      foreignKey: "videoId",
      through: "VideoBow",
    });

    Video.hasMany(models.VideoBow, {
      foreignKey: "videoId",
    });
  };
  return Video;
};
