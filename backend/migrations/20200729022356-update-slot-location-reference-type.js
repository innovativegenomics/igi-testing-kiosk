'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await queryInterface.renameColumn('Slots', 'location', 'locationOld');
    await queryInterface.addColumn('Slots', 'location', {
      type: Sequelize.INTEGER
    });
    const locations = (await queryInterface.sequelize.query(`select id,name from "Locations"`))[0];
    const slots = (await queryInterface.sequelize.query(`select id,"locationOld" from "Slots"`))[0];
    for(let s of slots) {
      if(!s.locationOld) {
        continue;
      }
      const id = (await queryInterface.sequelize.query(`select id from "Locations" where name='${s.locationOld}'`))[0][0].id;
      await queryInterface.bulkUpdate('Slots', {
        location: id
      }, {
        id: s.id
      });
    }
    await queryInterface.removeColumn('Slots', 'locationOld');
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.renameColumn('Slots', 'locationOld', 'location');
  }
};
