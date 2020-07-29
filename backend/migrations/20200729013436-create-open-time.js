'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('OpenTimes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      starttime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endtime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      buffer: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      window: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      location: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Locations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      available: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    const moment = require('moment');
    const locations = (await queryInterface.sequelize.query(`select id,name from "Locations"`))[0];
    const days = (await queryInterface.sequelize.query(`select "date",starthour,startminute,endhour,endminute,"window",buffer from "Days"`))[0];
    for(let d of days) {
      for(let l of locations) {
        const startTime = moment(d.date).set('hour', d.starthour).set('minute', d.startminute);
        const endTime = moment(d.date).set('hour', d.endhour).set('minute', d.endminute);
        for(let t = startTime;t.isBefore(endTime);t = t.add(d.window, 'minute')) {
          const count = (await queryInterface.sequelize.query(`select count(*)::integer from "Slots" where time='${t.format()}' and location='${l.name}'`))[0][0].count;
          await queryInterface.bulkInsert('OpenTimes', [
            {
              starttime: t.toDate(),
              endtime: t.clone().add(d.window, 'minute').toDate(),
              date: t.toDate(),
              buffer: d.buffer,
              window: d.window,
              location: l.id,
              available: d.buffer-count,
              createdAt: moment().toDate(),
              updatedAt: moment().toDate()
            }
          ]);
        }
      }
    }
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('OpenTimes');
  }
};