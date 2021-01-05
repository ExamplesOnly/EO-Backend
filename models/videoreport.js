"use strict";
const { nanoid } = require("nanoid");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VideoReport extends Model {
    static associate(models) {
      VideoReport.belongsTo(models.ReportType, {
        foreignKey: "reportId",
      });

      VideoReport.belongsTo(models.Video, {
        foreignKey: "videoId",
      });

      VideoReport.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
  }
  VideoReport.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: function () {
          return nanoid();
        },
        primaryKey: true,
        allowNull: false,
      },
      videoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reportId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "VideoReport",
    }
  );
  return VideoReport;
};
