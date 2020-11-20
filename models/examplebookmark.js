"use strict";
module.exports = (sequelize, DataTypes) => {
  const ExampleBookmark = sequelize.define(
    "ExampleBookmark",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
      },
      demandId: {
        type: DataTypes.INTEGER,
        references: {
          model: "ExampleDemand",
          key: "id",
        },
      },
    },
    {}
  );
  ExampleBookmark.associate = function (models) {
    // associations can be defined here
  };
  return ExampleBookmark;
};
