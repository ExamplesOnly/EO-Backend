"use strict";
const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserVerificationToken extends Model {
    static associate(models) {
      UserVerificationToken.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
  }
  UserVerificationToken.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: () => {
          return nanoid();
        },
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expireAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "UserVerificationToken",
    }
  );
  return UserVerificationToken;
};
