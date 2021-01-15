"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("UserSessions", {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      // devicePlatform: {
      //   type: Sequelize.STRING,
      // },
      deviceModel: {
        type: Sequelize.STRING,
      },
      deviceOS: {
        type: Sequelize.STRING,
      },
      deviceManufacture: {
        type: Sequelize.STRING,
      },
      clientPlatform: {
        type: Sequelize.STRING,
      },
      clientVersion: {
        type: Sequelize.STRING,
      },
      clientIP: {
        type: Sequelize.STRING,
      },
      clientCity: {
        type: Sequelize.STRING,
      },
      clientRegion: {
        type: Sequelize.STRING,
      },
      clientCountry: {
        type: Sequelize.STRING,
      },
      clientLat: {
        type: Sequelize.DOUBLE,
      },
      clientLong: {
        type: Sequelize.DOUBLE,
      },
      isClientApp: {
        type: Sequelize.BOOLEAN,
      },
      isClientMobile: {
        type: Sequelize.BOOLEAN,
      },
      lastRefreshAt: {
        type: Sequelize.DATE,
      },
      refreshToken: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("UserSessions");
  },
};
