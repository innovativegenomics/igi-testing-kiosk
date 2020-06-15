'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      middlename: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lastname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      calnetid: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      dob: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      street: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      county: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      zip: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sex: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      pbuilding: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      patientid: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      questions: {
        type: Sequelize.ARRAY(Sequelize.BOOLEAN),
        allowNull: false,
      },
      datejoined: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      lastlogin: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
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
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};