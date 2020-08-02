'use strict';
module.exports = (sequelize, DataTypes) => {
  const ReservedSlot = sequelize.define('ReservedSlot', {
    calnetid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {});
  ReservedSlot.associate = function(models) {
    // associations can be defined here
    ReservedSlot.belongsTo(models.Location, {
      foreignKey: 'location'
    });
    ReservedSlot.belongsTo(models.OpenTime);
  };
  return ReservedSlot;
};