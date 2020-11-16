"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
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
      bio: DataTypes.STRING,
      dob: DataTypes.DATEONLY,
      gender: DataTypes.STRING,
      phoneNumber: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      countryCode: DataTypes.STRING,
      profileImage: DataTypes.STRING,
      coverImage: DataTypes.STRING,
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
    User.hasMany(models.Video, {
      foreignKey: "userId",
    });
    User.belongsToMany(models.Category, {
      foreignKey: "userId",
      through: "UserCategory",
    });
    User.hasMany(models.ExampleDemand, {
      foreignKey: "userId",
    });
  };
  return User;
};
