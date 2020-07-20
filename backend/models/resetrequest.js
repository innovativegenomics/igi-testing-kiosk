'use strict';
module.exports = (sequelize, DataTypes) => {
  const ResetRequest = sequelize.define('ResetRequest', {
    uid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false
    },
    useruid: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {});
  ResetRequest.associate = function(models) {
    // associations can be defined here
  };
  return ResetRequest;
};