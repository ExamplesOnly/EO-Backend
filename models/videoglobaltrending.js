"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VideoGlobalTrending extends Model {
    static associate(models) {
      VideoGlobalTrending.belongsTo(models.Video, {
        foreignKey: "videoId",
      });
    }
  }
  VideoGlobalTrending.init(
    {
      videoId: DataTypes.INTEGER,
      trendingRank: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "VideoGlobalTrending",
    }
  );
  return VideoGlobalTrending;
};
