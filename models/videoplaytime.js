"use strict";
const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VideoPlayTime extends Model {
    static associate(models) {
      VideoPlayTime.belongsTo(models.VideoView, {
        foreignKey: "viewId",
      });
    }
  }
  VideoPlayTime.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: function () {
          return nanoid();
        },
        primaryKey: true,
        allowNull: false,
      },
      viewId: {
        type: DataTypes.UUID,
        unique: true,
      },
      playTime: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "VideoPlayTime",
    }
  );
  return VideoPlayTime;
};
