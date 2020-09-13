'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await queryInterface.removeColumn('Settings', 'locations');
    await queryInterface.removeColumn('Settings', 'locationlinks');
    await queryInterface.removeColumn('Settings', 'days');
    await queryInterface.removeColumn('Settings', 'starttime');
    await queryInterface.removeColumn('Settings', 'startminute');
    await queryInterface.removeColumn('Settings', 'endtime');
    await queryInterface.removeColumn('Settings', 'endminute');
    await queryInterface.removeColumn('Settings', 'window');
    await queryInterface.removeColumn('Settings', 'buffer');
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
