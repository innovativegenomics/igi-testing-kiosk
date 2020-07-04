'use strict';
module.exports = (sequelize, DataTypes) => {
  const ReservedSlot = sequelize.define('ReservedSlot', {
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
  };
  return ReservedSlot;
};