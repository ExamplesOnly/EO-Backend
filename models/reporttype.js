"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ReportType extends Model {
    static associate(models) {
      ReportType.hasMany(models.VideoReport, {
        foreignKey: "reportId",
      });
    }
  }
  ReportType.init(
    {
      title: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ReportType",
    }
  );
  return ReportType;
};
