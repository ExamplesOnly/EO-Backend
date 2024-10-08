"use strict";
const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VideoView extends Model {
    static associate(models) {
      VideoView.belongsTo(models.VideoReach, {
        foreignKey: "reachId",
      });
      VideoView.hasOne(models.VideoPlayTime, {
        foreignKey: "viewId",
      });
    }
  }
  VideoView.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: function () {
          return nanoid();
        },
        primaryKey: true,
        allowNull: false,
      },
      reachId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "VideoView",
    }
  );
  return VideoView;
};
