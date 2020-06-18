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
      'Slots', // name of Source model
      'question1', // name of the key we're adding 
      {
        type: Sequelize.INTEGER,
      }
    );
    await queryInterface.addColumn(
      'Slots', // name of Source model
      'question2', // name of the key we're adding 
      {
        type: Sequelize.INTEGER,
      }
    );
    await queryInterface.addColumn(
      'Slots', // name of Source model
      'question3', // name of the key we're adding 
      {
        type: Sequelize.STRING,
      }
    );
    await queryInterface.addColumn(
      'Slots', // name of Source model
      'question4', // name of the key we're adding 
      {
        type: Sequelize.STRING,
      }
    );
    await queryInterface.addColumn(
      'Slots', // name of Source model
      'question5', // name of the key we're adding 
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
    await queryInterface.removeColumn('Slots', 'question1');
    await queryInterface.removeColumn('Slots', 'question2');
    await queryInterface.removeColumn('Slots', 'question3');
    await queryInterface.removeColumn('Slots', 'question4');
    await queryInterface.removeColumn('Slots', 'question5');
  }
};
