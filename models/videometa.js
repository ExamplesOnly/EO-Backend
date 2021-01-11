"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VideoMeta extends Model {
    static associate(models) {
      VideoMeta.belongsTo(models.Video, {
        foreignKey: "videoId",
      });
    }
  }
  VideoMeta.init(
    {
      videoId: DataTypes.INTEGER,
      duration: DataTypes.INTEGER,
      bow: DataTypes.INTEGER,
      view: DataTypes.INTEGER,
      uniqueView: DataTypes.INTEGER,
      totalPlayTime: DataTypes.INTEGER,
      totalBookmark: DataTypes.INTEGER,
      eoi: DataTypes.DOUBLE,
    },
    {
      sequelize,
      modelName: "VideoMeta",
    }
  );
  return VideoMeta;
};
