'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Days', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      starthour: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      startminute: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      endhour: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      endminute: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      window: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      buffer: {
        type: Sequelize.INTEGER,
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
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Days');
  }
};