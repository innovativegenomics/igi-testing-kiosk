'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    const moment = require('moment');

    const bad = (await queryInterface.sequelize.query(`select * from "Slots" as s where "OpenTimeId"!=(select id from "OpenTimes" as ot where s.time=ot.starttime and s.location=ot.location)`))[0];
    for(let slot of bad) {
      await queryInterface.sequelize.query(`update "OpenTimes" set available=available+1 where id=${slot.OpenTimeId}`);
      const realOpenTime = (await queryInterface.sequelize.query(`select * from "OpenTimes" where starttime='${moment(slot.time).format()}' and location=${slot.location}`))[0][0];
      await queryInterface.sequelize.query(`update "Slots" set "OpenTimeId"='${realOpenTime.id}' where id='${slot.id}'`);
    }
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
