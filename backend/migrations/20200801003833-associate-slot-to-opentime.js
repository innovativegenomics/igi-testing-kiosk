'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await queryInterface.addColumn('Slots', 'OpenTimeId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'OpenTimes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    const moment = require('moment');
    const slots = (await queryInterface.sequelize.query(`select id,time,location from "Slots"`))[0];
    for(let s of slots) {
      console.log(moment(s.time).format());
      console.log(s.location);
      console.log(`select id from "OpenTimes" where starttime='${moment(s.time).format()}' and location=${s.location}`);
      const ot = (await queryInterface.sequelize.query(`select id from "OpenTimes" where starttime='${moment(s.time).format()}' and location=${s.location}`))[0][0];
      console.log(ot);
      try {
        await queryInterface.sequelize.query(`update "Slots" set "OpenTimeId"='${ot.id}' where id='${s.id}'`);
      } catch(err) {
        console.error(`unable to create association for id ${s.id}`);
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
    return queryInterface.removeColumn('Slots', 'OpenTimeId');
  }
};
