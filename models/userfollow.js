"use strict";
const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserFollow extends Model {
    static associate(models) {
      UserFollow.belongsTo(models.User, {
        as: "follower",
        foreignKey: "followerUuid",
        targetKey: "uuid",
      });
      UserFollow.belongsTo(models.User, {
        as: "following",
        foreignKey: "followingUuid",
        targetKey: "uuid",
      });
    }
  }
  UserFollow.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: () => {
          return nanoid();
        },
        primaryKey: true,
        allowNull: false,
      },
      followerUuid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      followingUuid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "UserFollow",
    }
  );
  return UserFollow;
};
