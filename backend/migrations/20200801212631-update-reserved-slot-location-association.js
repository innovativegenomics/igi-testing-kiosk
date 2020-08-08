'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await queryInterface.renameColumn('ReservedSlots', 'location', 'locationOld');
    await queryInterface.addColumn('ReservedSlots', 'location', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Locations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    const locations = (await queryInterface.sequelize.query(`select id,name from "Locations"`))[0];
    const slots = (await queryInterface.sequelize.query(`select id,"locationOld" from "ReservedSlots"`))[0];
    for(let s of slots) {
      if(!s.locationOld) {
        continue;
      }
      const id = (await queryInterface.sequelize.query(`select id from "Locations" where name='${s.locationOld}'`))[0][0].id;
      await queryInterface.bulkUpdate('ReservedSlots', {
        location: id
      }, {
        id: s.id
      });
    }
    await queryInterface.removeColumn('ReservedSlots', 'locationOld');
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
