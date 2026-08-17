// models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firebaseUid: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    field: 'firebase_uid'
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'full_name'
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true // Nullable because Firebase handles auth
  },
  photoURL: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'photo_url'
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'phone_number'
  },
  role: {
    type: DataTypes.ENUM('client', 'user', 'admin'),
    defaultValue: 'client'
  },
  isClient: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_client'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  walletBalance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'wallet_balance'
  },
  totalEarnings: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'total_earnings'
  },
  totalWithdrawn: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'total_withdrawn'
  },
  totalSpent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'total_spent'
  },
  tasksCompleted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'tasks_completed'
  },
  ordersCreated: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'orders_created'
  },
  userLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'user_level'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isSuspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_suspended'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  },
  notificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'notifications_enabled'
  },
  theme: {
    type: DataTypes.ENUM('light', 'dark'),
    defaultValue: 'light'
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['firebase_uid'] },
    { fields: ['email'] },
    { fields: ['role'] }
  ]
});

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password') && user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Instance method to compare passwords
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hide sensitive fields when converting to JSON
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;