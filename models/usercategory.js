"use strict";
module.exports = (sequelize, DataTypes) => {
  const UserCategory = sequelize.define(
    "UserCategory",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Category",
          key: "id",
        },
      },
    },
    {}
  );
  UserCategory.associate = function (models) {
    // associations can be defined here
  };
  return UserCategory;
};
