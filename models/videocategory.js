"use strict";
module.exports = (sequelize, DataTypes) => {
  const VideoCategory = sequelize.define(
    "VideoCategory",
    {
      videoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Video",
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
  VideoCategory.associate = function (models) {
    // associations can be defined here
  };
  return VideoCategory;
};
