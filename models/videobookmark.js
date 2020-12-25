"use strict";
const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VideoBookmark extends Model {
    static associate(models) {}
  }
  VideoBookmark.init(
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
      modelName: "VideoBookmark",
    }
  );
  return VideoBookmark;
};
