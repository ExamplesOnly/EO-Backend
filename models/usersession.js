"use strict";
const { Model } = require("sequelize");
const { nanoid } = require("nanoid");

module.exports = (sequelize, DataTypes) => {
  class UserSession extends Model {
    static associate(models) {
      UserSession.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
  }
  UserSession.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: function () {
          return nanoid();
        },
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      deviceModel: DataTypes.STRING,
      deviceOS: DataTypes.STRING,
      deviceManufacture: DataTypes.STRING,
      clientPlatform: DataTypes.STRING,
      clientVersion: DataTypes.STRING,
      clientIP: DataTypes.STRING,
      clientCity: DataTypes.STRING,
      clientRegion: DataTypes.STRING,
      clientCountry: DataTypes.STRING,
      clientLat: DataTypes.DOUBLE,
      clientLong: DataTypes.DOUBLE,
      isClientApp: DataTypes.BOOLEAN,
      isClientMobile: DataTypes.BOOLEAN,
      lastRefreshAt: DataTypes.DATE,
      refreshToken: DataTypes.STRING,
      fcmToken: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "UserSession",
    }
  );
  return UserSession;
};
