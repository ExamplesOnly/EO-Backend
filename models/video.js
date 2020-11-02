"use strict";
module.exports = (sequelize, DataTypes) => {
  const Video = sequelize.define(
    "Video",
    {
      videoId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      size: DataTypes.INTEGER,
      length: DataTypes.INTEGER,
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      url: DataTypes.STRING,
      thumbUrl: DataTypes.STRING,
    },
    {}
  );
  Video.associate = function (models) {
    Video.belongsTo(models.User, {
      foreignKey: "userId",
    });
    Video.belongsToMany(models.Category, {
      foreignKey: "videoId",
      through: "VideoCategory",
    });
  };
  return Video;
};
