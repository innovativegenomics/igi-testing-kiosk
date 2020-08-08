'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await queryInterface.addColumn('ReservedSlots', 'OpenTimeId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'OpenTimes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    const moment = require('moment');
    const reserved = (await queryInterface.sequelize.query(`select id,time,location from "ReservedSlots"`))[0];
    for(let r of reserved) {
      const ot = (await queryInterface.sequelize.query(`select id from "OpenTimes" where starttime='${moment(r.time).format()}' and location=${r.location}`))[0][0];
      try {
        await queryInterface.bulkUpdate('ReservedSlots', {
          OpenTimeId: ot.id
        }, {
          id: r.id
        });
      } catch(err) {
        console.error(`error adding openslot id`);
        console.error(err.stack);
      }
    }
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.removeColumn('ReservedSlots', 'OpenTimeId');
  }
};
