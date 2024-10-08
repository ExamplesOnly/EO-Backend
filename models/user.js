"use strict";

const cdnHost = process.env.AWS_CLOUFRONT_PUBLIC_HOST
  ? process.env.AWS_CLOUFRONT_PUBLIC_HOST
  : "cdn.examplesonly.com";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.STRING,
        // allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: DataTypes.STRING,
      middleName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      password: DataTypes.STRING,
      bio: DataTypes.STRING,
      dob: DataTypes.DATEONLY,
      gender: DataTypes.STRING,
      phoneNumber: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      countryCode: DataTypes.STRING,
      profileImageKey: DataTypes.STRING,
      coverImageKey: DataTypes.STRING,
      profileImage: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ["profileImageKey"]),
        get() {
          return this.profileImageKey
            ? `https://${cdnHost}/${this.profileImageKey}`
            : null;
        },
      },
      coverImage: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ["coverImageKey"]),
        get() {
          return this.coverImageKey
            ? `https://${cdnHost}/${this.coverImageKey}`
            : null;
        },
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      blocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      verification_token: DataTypes.STRING,
      verification_expires: DataTypes.DATE,
      googleId: DataTypes.STRING,
    },
    {}
  );
  User.associate = function (models) {
    User.hasMany(models.UserSession, {
      foreignKey: "userId",
    });

    User.hasMany(models.Video, {
      foreignKey: "userId",
    });

    User.hasMany(models.VideoBookmark, {
      foreignKey: "userId",
    });

    User.hasMany(models.UserFollow, {
      as: "follower",
      foreignKey: "followerUuid",
      sourceKey: "uuid",
    });

    User.hasMany(models.UserFollow, {
      as: "following",
      foreignKey: "followingUuid",
      sourceKey: "uuid",
    });

    User.belongsToMany(models.Category, {
      foreignKey: "userId",
      through: "UserCategory",
    });

    User.hasMany(models.ExampleDemand, {
      foreignKey: "userId",
    });

    User.belongsToMany(models.ExampleDemand, {
      foreignKey: "userId",
      through: "ExampleBookmark",
    });

    User.belongsToMany(models.Video, {
      through: {
        model: models.VideoView,
        foreignKey: "userId",
        unique: false,
      },
    });

    User.hasMany(models.VideoView, {
      foreignKey: "userId",
    });

    User.belongsToMany(models.Video, {
      foreignKey: "userId",
      through: "VideoBow",
    });

    User.hasMany(models.VideoBow, {
      foreignKey: "userId",
    });

    User.hasMany(models.NotifyBow, {
      foreignKey: "bowByUserId",
    });

    User.hasMany(models.Notification, {
      foreignKey: "notificationForUserId",
      as: "notificationForUser",
    });

    User.hasMany(models.Notification, {
      foreignKey: "actionByUserId",
      as: "actionByUser",
    });

    User.hasMany(models.VideoReach, {
      foreignKey: "userId",
    });

    User.hasMany(models.VideoPlayTime, {
      foreignKey: "userId",
    });

    User.hasMany(models.VideoReport, {
      foreignKey: "userId",
    });

    User.hasMany(models.UserVerificationToken, {
      foreignKey: "userId",
    });
  };
  return User;
};
