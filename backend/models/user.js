'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    middlename: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    calnetid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    county: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sex: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pbuilding: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    patientid: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    questions: {
      type: DataTypes.ARRAY(DataTypes.BOOLEAN),
      allowNull: false,
    },
    datejoined: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    lastlogin: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    accessresultssent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    reconsented: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    availableStart: {
      type: DataTypes.DATE
    },
    availableEnd: {
      type: DataTypes.DATE
    }
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Slot, {
      foreignKey: 'calnetid',
      sourceKey: 'calnetid',
      targetKey: 'calnetid'
    });
    User.belongsTo(models.ExternalUser, {
      foreignKey: 'calnetid',
      sourceKey: 'calnetid',
      targetKey: 'calnetid'
    });
  };
  return User;
};