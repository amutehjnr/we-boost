// models/PlatformSetting.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlatformSetting = sequelize.define('PlatformSetting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'platform_settings',
  timestamps: true,
  indexes: [{ unique: true, fields: ['key'] }]
});

module.exports = PlatformSetting;