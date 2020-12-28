"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VideoCategoryTrending extends Model {
    static associate(models) {
      VideoCategoryTrending.belongsTo(models.Video, {
        foreignKey: "videoId",
      });
      VideoCategoryTrending.belongsTo(models.Category, {
        foreignKey: "categoryId",
      });
    }
  }
  VideoCategoryTrending.init(
    {
      videoId: DataTypes.INTEGER,
      categoryId: DataTypes.INTEGER,
      trendingRank: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "VideoCategoryTrending",
    }
  );
  return VideoCategoryTrending;
};
