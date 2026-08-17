// models/Order.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    field: 'order_id'
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
      'YoutubeMusic'
    ),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'Followers', 
      'Likes', 
      'Views', 
      'Comments', 
      'Streams', 
      'Shares',
      'Subscribers',
      'Retweets'
    ),
    allowNull: false
  },
  service: {
    type: DataTypes.ENUM('Basic', 'Moderate', 'High'),
    allowNull: false
  },
  targetUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'target_url',
    comment: 'Profile link or username'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 100,
      max: 10000000
    }
  },
  quantityDelivered: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'quantity_delivered'
  },
  rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Rate per 1000'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount'
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Processing', 'In Progress', 'Completed', 'Cancelled', 'Failed'),
    defaultValue: 'Pending'
  },
  startCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'start_count',
    comment: 'Initial count before order started'
  },
  currentCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'current_count',
    comment: 'Current count during delivery'
  },
  remainingQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'remaining_quantity'
  },
  progressPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    field: 'progress_percentage'
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'started_at'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  estimatedCompletionTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'estimated_completion_time'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cancellation_reason'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['order_id'] },
    { fields: ['status'] },
    { fields: ['platform'] },
    { fields: ['created_at'] }
  ]
});

// Hooks
Order.beforeCreate(async (order) => {
  // Generate unique order ID
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  order.orderId = `ORD${timestamp}${random}`;
  
  // Calculate remaining quantity
  order.remainingQuantity = order.quantity;
});

Order.beforeUpdate(async (order) => {
  // Update progress percentage
  if (order.quantityDelivered && order.quantity) {
    order.progressPercentage = (order.quantityDelivered / order.quantity) * 100;
    order.remainingQuantity = order.quantity - order.quantityDelivered;
  }
  
  // Auto-complete if fully delivered
  if (order.quantityDelivered >= order.quantity && order.status !== 'Completed') {
    order.status = 'Completed';
    order.completedAt = new Date();
  }
});

module.exports = Order;