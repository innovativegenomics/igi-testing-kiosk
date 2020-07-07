'use strict';
module.exports = (sequelize, DataTypes) => {
  const Settings = sequelize.define('Settings', {
    locations: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    locationlinks: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    days: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false,
      defaultValue: [1, 2, 3, 4, 5],
    },
    starttime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 13,
    },
    startminute: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    endtime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 16,
    },
    endminute: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    window: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    buffer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
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
    }
  }, {});
  Settings.associate = function(models) {
    // associations can be defined here
  };
  return Settings;
};