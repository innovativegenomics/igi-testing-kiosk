'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await queryInterface.addColumn('Users', 'affiliation', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'N/A'
    });
    await queryInterface.addColumn('Users', 'housing', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'N/A'
    });
    await queryInterface.addColumn('Users', 'residents', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.removeColumn('Users', 'affiliation');
    await queryInterface.removeColumn('Users', 'housing');
    await queryInterface.removeColumn('Users', 'residents');
  }
};
