"use strict";
const { Model } = require("sequelize");
const { nanoid } = require("nanoid");

const uppercaseFirst = (str) => `${str[0].toUpperCase()}${str.substr(1)}`;

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // Association with bow notification
      Notification.belongsTo(models.NotifyBow, {
        foreignKey: "typeId",
        constraints: false,
      });

      // Association with follow notification
      Notification.belongsTo(models.NotifyFollow, {
        foreignKey: "typeId",
        constraints: false,
      });

      Notification.belongsTo(models.User, {
        foreignKey: "notificationForUserId",
      });
      Notification.belongsTo(models.User, {
        foreignKey: "actionByUserId",
      });
    }

    getType(options) {
      if (!this.type) return Promise.resolve(null);
      const mixinMethodName = `get${uppercaseFirst(this.type)}`;
      return this[mixinMethodName](options);
    }
  }
  Notification.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: function () {
          return nanoid();
        },
        allowNull: false,
        unique: true,
      },
      notificationForUserId: DataTypes.INTEGER,
      actionByUserId: DataTypes.INTEGER,
      type: DataTypes.STRING,
      typeId: DataTypes.INTEGER,
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Notification",
    }
  );

  Notification.addHook("afterFind", (findResult) => {
    if (!Array.isArray(findResult)) findResult = [findResult];
    for (const instance of findResult) {
      if (instance.type === "NotifyBow" && instance.NotifyBow !== undefined) {
        instance.typeData = instance.NotifyBow;
      } else if (
        instance.type === "NotifyFollow" &&
        instance.NotifyFollow !== undefined
      ) {
        instance.typeData = instance.NotifyFollow;
      }
      // To prevent mistakes:
      delete instance.NotifyBow;
      delete instance.dataValues.NotifyBow;
      delete instance.NotifyFollow;
      delete instance.dataValues.NotifyFollow;
    }
  });
  return Notification;
};
