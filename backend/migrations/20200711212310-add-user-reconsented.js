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
      'Users', // name of Source model
      'reconsented', // name of the key we're adding 
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false // 3 minutes by default
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
    await queryInterface.removeColumn('Users', 'reconsented');
  }
};
