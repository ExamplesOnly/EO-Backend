"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "Users",
    {
      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: DataTypes.STRING,
      middleName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      countryCode: DataTypes.STRING,
      profileImage: DataTypes.INTEGER,
      coverImage: DataTypes.INTEGER,
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      blocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      verification_token: DataTypes.STRING,
      verification_expires: DataTypes.DATE,
    },
    {}
  );
  User.associate = function (models) {
    // associations can be defined here
  };
  return User;
};
