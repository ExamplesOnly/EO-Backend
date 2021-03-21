"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VideoBow extends Model {
    static associate(models) {
      // VideoBow.hasMany(models.User);
      // VideoBow.hasOne(models.NotifyBow, {
      //   foreignKey: "bowId",
      // });
    }
  }
  VideoBow.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
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
