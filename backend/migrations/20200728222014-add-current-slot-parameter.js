'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await queryInterface.addColumn('Slots', 'current', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    await queryInterface.bulkUpdate('Slots', {
        current: true,
      },
      Sequelize.literal(`"Slots".id in (select "Slots".id from "Slots",(select max(time) as time,calnetid from "Slots" group by calnetid) as s where "Slots".calnetid=s.calnetid and "Slots".time=s.time)`)
    );
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.removeColumn('Slots', 'current');
  }
};
