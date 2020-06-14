'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      locations: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: [],
      },
      locationlinks: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: [],
      },
      days: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
        defaultValue: [1, 2, 3, 4, 5],
      },
      starttime: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 13,
      },
      endtime: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 16,
      },
      increment: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      buffer: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3,
      },
      accesstoken: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      refreshtoken: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
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
    return queryInterface.dropTable('Settings');
  }
};