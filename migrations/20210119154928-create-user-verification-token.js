'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("UserVerificationTokens", {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      token: {
        type: Sequelize.STRING,
      },
      expireAt: {
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserVerificationTokens');
  }
};