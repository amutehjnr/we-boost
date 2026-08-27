// models/LinkedAccount.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LinkedAccount = sequelize.define('LinkedAccount', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  platform: {
    type: DataTypes.ENUM(
      'Facebook', 
      'Instagram', 
      'TikTok', 
      'Twitter', 
      'YouTube', 
      'Spotify', 
      'Audiomack', 
      'YoutubeMusic',
      'LinkedIn',
      'Twitch',
      'Telegram'
    ),
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'profile_url'
  },
  platformUserId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'platform_user_id',
    comment: 'Unique ID from the platform'
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'access_token',
    comment: 'Encrypted OAuth token'
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'refresh_token'
  },
  tokenExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'token_expires_at'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified'
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at'
  },
  lastSynced: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_synced'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional platform-specific data'
  }
}, {
  tableName: 'linked_accounts',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['platform'] },
    { unique: true, fields: ['user_id', 'platform'] }
  ]
});

module.exports = LinkedAccount;