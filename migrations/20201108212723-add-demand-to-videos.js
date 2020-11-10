"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Videos", "demandId", {
      type: Sequelize.INTEGER,
      references: {
        model: "ExampleDemands",
        key: "id",
      },
    });
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn("Videos", "demandId");
  },
};
