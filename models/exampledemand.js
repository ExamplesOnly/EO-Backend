"use strict";
module.exports = (sequelize, DataTypes) => {
  const ExampleDemand = sequelize.define(
    "ExampleDemand",
    {
      uuid: DataTypes.STRING,
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      categoryId: DataTypes.INTEGER,
    },
    {}
  );
  ExampleDemand.associate = function (models) {
    ExampleDemand.belongsTo(models.Category, {
      foreignKey: "categoryId",
    });

    ExampleDemand.belongsTo(models.User, {
      foreignKey: "userId",
    });

    ExampleDemand.hasMany(models.Video, {
      foreignKey: "userId",
    });
  };
  return ExampleDemand;
};
