'use strict';
module.exports = (sequelize, DataTypes) => {
  const Dropoff = sequelize.define('Dropoff', {
    name: DataTypes.STRING,
    map: DataTypes.STRING
  }, {});
  Dropoff.associate = function(models) {
    Dropoff.hasMany(models.DropoffDay, {
      foreignKey: 'location'
    });
  };
  return Dropoff;
};