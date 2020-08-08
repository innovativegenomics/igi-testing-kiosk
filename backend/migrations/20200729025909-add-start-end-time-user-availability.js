'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await queryInterface.addColumn('Users', 'availableStart', {
      type: Sequelize.DATE
    });
    await queryInterface.addColumn('Users', 'availableEnd', {
      type: Sequelize.DATE
    });
    const moment = require('moment');
    const currentSlots = (await queryInterface.sequelize.query(`select calnetid,time from "Slots" where current=true`))[0];
    for(let s of currentSlots) {
      const start = moment(s.time).startOf('week');
      const end = start.clone().add(1, 'week');
      await queryInterface.sequelize.query(`update "Users" set "availableStart"='${start.format()}',"availableEnd"='${end.format()}' where calnetid='${s.calnetid}'`);
    }
    await queryInterface.sequelize.query(`delete from "Slots" where location is null`);
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.removeColumn('Users', 'availableStart');
    await queryInterface.removeColumn('Users', 'availableEnd');
  }
};
