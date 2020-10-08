'use strict';
module.exports = (sequelize, DataTypes) => {
  const DropoffDay = sequelize.define('DropoffDay', {
    location: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
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
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    available: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
  DropoffDay.associate = function(models) {
    DropoffDay.belongsTo(models.Dropoff, {
      foreignKey: 'location'
    });
    DropoffDay.hasMany(models.Tube);
  };
  return DropoffDay;
};