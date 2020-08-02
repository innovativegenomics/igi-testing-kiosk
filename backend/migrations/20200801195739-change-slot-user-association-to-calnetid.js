'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await queryInterface.changeColumn('Slots', 'calnetid', {
      type: Sequelize.STRING,
      references: {
        model: 'Users',
        key: 'calnetid'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    await queryInterface.removeColumn('Slots', 'UserId');
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
