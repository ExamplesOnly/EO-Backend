"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "Users",
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      first_name: DataTypes.STRING,
      middle_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      password: DataTypes.STRING,
      phone_number: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      country_code: DataTypes.STRING,
      profile_image: DataTypes.INTEGER,
      cover_image: DataTypes.INTEGER,
    },
    {}
  );
  User.associate = function (models) {
    // associations can be defined here
  };
  return User;
};
