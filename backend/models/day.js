'use strict';
module.exports = (sequelize, DataTypes) => {
  const Day = sequelize.define('Day', {
    starthour: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startminute: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    endhour: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    endminute: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    window: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    buffer: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {});
  Day.associate = function(models) {
    // associations can be defined here
  };
  return Day;
};