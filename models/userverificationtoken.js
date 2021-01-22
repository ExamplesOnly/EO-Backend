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
        defaultValue: function () {
          return nanoid();
        },
        primaryKey: true,
        allowNull: false,
      },
      userId: DataTypes.INTEGER,
      token: DataTypes.STRING,
      expireAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "UserVerificationToken",
    }
  );
  return UserVerificationToken;
};
