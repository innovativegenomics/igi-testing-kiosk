'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Tubes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      calnetid: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pickup: {
        type: Sequelize.DATE,
        allowNull: false
      },
      dropoff: {
        type: Sequelize.DATE,
        allowNull: true
      },
      current: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      scheduledDropoff: {
        type: Sequelize.DATEONLY,
        allowNull: true
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
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Tubes');
  }
};