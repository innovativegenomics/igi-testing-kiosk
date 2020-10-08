'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('DropoffDays', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      location: {
        type: Sequelize.INTEGER
      },
      starttime: {
        type: Sequelize.DATE
      },
      endtime: {
        type: Sequelize.DATE
      },
      date: {
        type: Sequelize.DATEONLY
      },
      capacity: {
        type: Sequelize.INTEGER
      },
      available: {
        type: Sequelize.INTEGER
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
    return queryInterface.dropTable('DropoffDays');
  }
};