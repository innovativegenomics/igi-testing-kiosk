'use strict';
module.exports = (sequelize, DataTypes) => {
  const Slot = sequelize.define('Slot', {
    calnetid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    scheduled: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    uid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    question1: {
      type: DataTypes.INTEGER
    },
    question2: {
      type: DataTypes.INTEGER
    },
    question3: {
      type: DataTypes.STRING
    },
    question4: {
      type: DataTypes.STRING
    },
    question5: {
      type: DataTypes.STRING
    },
    current: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {});
  Slot.associate = function(models) {
    // associations can be defined here
    Slot.belongsTo(models.User);
  };
  return Slot;
};