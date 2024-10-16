// const DataTypes = require('sequelize');
// const sequelize = require('../utils/database');
// const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const UserModel = sequelize.define('user', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    NAME_FIRST: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    NAME_LAST: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    PK_EMAIL: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    PASSWORD: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleId:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    role_title:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active:{
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deletedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    tableName: 'USER', // Specify the custom table name
  });

  return UserModel;
}

