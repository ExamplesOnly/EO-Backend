"use strict";
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      title: DataTypes.STRING,
      thumbUrl: DataTypes.STRING,
      slug: DataTypes.STRING,
    },
    {}
  );
  Category.associate = function (models) {
    Category.belongsToMany(models.User, {
      foreignKey: "categoryId",
      through: "UserCategory",
    });
  };
  return Category;
};
