'use strict';
module.exports = (sequelize, DataTypes) => {
  const OpenTime = sequelize.define('OpenTime', {
    starttime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endtime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    buffer: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    window: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    location: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    available: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
  OpenTime.associate = function(models) {
    // associations can be defined here
    OpenTime.belongsTo(models.Location, {
      foreignKey: 'location'
    });
  };
  return OpenTime;
};