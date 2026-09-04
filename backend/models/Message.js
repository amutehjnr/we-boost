// models/Message.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'conversation_id'
  },
  senderType: {
    type: DataTypes.ENUM('user', 'guest', 'admin'),
    allowNull: false,
    field: 'sender_type'
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'sender_id',
    comment: 'The admin or logged-in user\'s id. Null for a guest sender.'
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  readByAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'read_by_admin'
  },
  readByVisitor: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'read_by_visitor'
  }
}, {
  tableName: 'messages',
  timestamps: true,
  indexes: [
    { fields: ['conversation_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Message;