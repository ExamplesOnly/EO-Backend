"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VideoView extends Model {
    static associate(models) {
      // define association here
    }
  }
  VideoView.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    },
    {
      sequelize,
      modelName: "VideoView",
    }
  );
  return VideoView;
};
