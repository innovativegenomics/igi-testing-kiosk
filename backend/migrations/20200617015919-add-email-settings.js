'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await queryInterface.addColumn(
      'Settings', // name of Source model
      'EmailAccessToken', // name of the key we're adding 
      {
        type: Sequelize.STRING,
      }
    );
    await queryInterface.addColumn(
      'Settings', // name of Source model
      'EmailRefreshToken', // name of the key we're adding 
      {
        type: Sequelize.STRING,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.removeColumn('Settings', 'EmailAccessToken');
    await queryInterface.removeColumn('Settings', 'EmailRefreshToken');
  }
};
