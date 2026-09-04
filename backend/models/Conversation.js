// models/Conversation.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id',
    comment: 'Null for a guest (not logged in) conversation'
  },
  guestName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'guest_name'
  },
  guestEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'guest_email'
  },
  guestToken: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'guest_token',
    comment: 'Random token the guest\'s browser holds to prove ownership of this conversation without an account'
  },
  status: {
    type: DataTypes.ENUM('Open', 'Closed'),
    defaultValue: 'Open'
  },
  assignedAdminId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'assigned_admin_id'
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_message_at'
  }
}, {
  tableName: 'conversations',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['guest_token'] }
  ]
});

module.exports = Conversation;