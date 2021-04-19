"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class NotifyFollow extends Model {
    static associate(models) {
      NotifyFollow.hasOne(models.Notification, {
        foreignKey: "typeId",
        constraints: false,
        scope: {
          type: "NotifyFollow",
        },
      });
      NotifyFollow.belongsTo(models.User, {
        foreignKey: "followByUserId",
        targetKey: "uuid",
      });
    }
  }
  NotifyFollow.init(
    {
      followId: DataTypes.STRING,
      followByUserId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "NotifyFollow",
    }
  );
  return NotifyFollow;
};
