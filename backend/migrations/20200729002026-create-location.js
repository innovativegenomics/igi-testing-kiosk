'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      map: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    const oldLocations = (await queryInterface.sequelize.query(`select locations,locationlinks from "Settings"`))[0][0];
    await queryInterface.bulkInsert(
      'Locations',
      oldLocations.locations.map((v, i) => 
        ({
          name: v,
          map: oldLocations.locationlinks[i],
          createdAt: new Date(),
          updatedAt: new Date()
        })
      )
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Locations');
  }
};