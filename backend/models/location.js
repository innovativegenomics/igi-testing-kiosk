'use strict';
module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define('Location', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    map: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});
  Location.associate = function(models) {
    // associations can be defined here
    Location.hasMany(models.OpenTime, {
      foreignKey: 'location'
    });
  };
  return Location;
};