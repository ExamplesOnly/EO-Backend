"use strict";
const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VideoReach extends Model {
    static associate(models) {
      VideoReach.hasOne(models.VideoView, {
        foreignKey: "reachId",
      });
    }
  }
  VideoReach.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: function () {
          return nanoid();
        },
        primaryKey: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "VideoReach",
    }
  );
  return VideoReach;
};
