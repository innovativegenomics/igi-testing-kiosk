'use strict';
module.exports = (sequelize, DataTypes) => {
  const Settings = sequelize.define('Settings', {
    accesstoken: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    refreshtoken: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    EmailAccessToken: {
      type: DataTypes.STRING
    },
    EmailRefreshToken: {
      type: DataTypes.STRING
    },
    ReservedSlotTimeout: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 180,
    },
    sendRescheduleEmails: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {});
  Settings.associate = function(models) {
    // associations can be defined here
  };
  return Settings;
};