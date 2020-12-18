"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VideoReach extends Model {
    static associate(models) {
      // define association here
    }
  }
  VideoReach.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    },
    {
      sequelize,
      modelName: "VideoReach",
    }
  );
  return VideoReach;
};
