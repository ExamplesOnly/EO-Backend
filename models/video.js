"use strict";
module.exports = (sequelize, DataTypes) => {
  const Video = sequelize.define(
    "Videos",
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
    },
    {}
  );
  Video.associate = function (models) {
    Video.belongsTo(models.Users, {
      foreignKey: "userId",
    });
  };
  return Video;
};
