'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tube = sequelize.define('Tube', {
    calnetid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pickup: {
      type: DataTypes.DATE,
      allowNull: false
    },
    dropoff: {
      type: DataTypes.DATE,
      allowNull: true
    },
    current: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    scheduledDropoff: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
  }, {});
  Tube.associate = function(models) {
    Tube.belongsTo(models.User, {
      foreignKey: 'calnetid',
      sourceKey: 'calnetid',
      targetKey: 'calnetid'
    });
    Tube.belongsTo(models.DropoffDay);
  };
  return Tube;
};