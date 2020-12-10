"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VideoBow extends Model {
    static associate(models) {
      // define association here
      // VideoBow.hasMany(models.User);
    }
  }
  VideoBow.init(
    {
      videoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Video",
          key: "id",
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "VideoBow",
    }
  );
  return VideoBow;
};
