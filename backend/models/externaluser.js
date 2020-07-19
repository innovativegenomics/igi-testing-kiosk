'use strict';
module.exports = (sequelize, DataTypes) => {
  const ExternalUser = sequelize.define('ExternalUser', {
    calnetid: {
      type: DataTypes.STRING,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING
    },
    approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    jobDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    employer: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    workFrequency: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
  }, {});
  ExternalUser.associate = function(models) {
    // associations can be defined here
  };
  return ExternalUser;
};