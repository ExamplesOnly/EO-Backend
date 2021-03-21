"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class NotifyBow extends Model {
    static associate(models) {
      NotifyBow.hasOne(models.Notification, {
        foreignKey: "typeId",
        constraints: false,
        scope: {
          type: "NotifyBow",
        },
      });
      // NotifyBow.belongsTo(models.VideoBow, {
      //   foreignKey: "bowId",
      // });
      // NotifyBow.belongsTo(models.Video, {
      //   foreignKey: "videoId",
      // });
      NotifyBow.belongsTo(models.User, {
        foreignKey: "bowByUserId",
      });
    }
  }
  NotifyBow.init(
    {
      videoId: DataTypes.INTEGER,
      bowId: DataTypes.INTEGER,
      bowByUserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "NotifyBow",
    }
  );
  return NotifyBow;
};
