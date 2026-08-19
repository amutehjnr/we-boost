// models/Payment.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transactionId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    field: 'transaction_id'
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
  orderId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'order_id',
    references: {
      model: 'orders',
      key: 'id'
    },
    comment: 'Associated order if payment is for an order'
  },
  type: {
    type: DataTypes.ENUM('Deposit', 'Order Payment', 'Refund', 'Bonus'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'NGN'
  },
  paymentMethod: {
    type: DataTypes.ENUM('Bank Transfer', 'Card', 'Crypto', 'Paystack', 'Flutterwave', 'Wallet'),
    allowNull: false,
    field: 'payment_method'
  },
  paymentGateway: {
    type: DataTypes.ENUM('Paystack', 'Flutterwave', 'Manual', 'Internal'),
    allowNull: true,
    field: 'payment_gateway'
  },
  gatewayReference: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'gateway_reference',
    comment: 'Reference from payment gateway'
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Processing', 'Successful', 'Failed', 'Cancelled', 'Refunded'),
    defaultValue: 'Pending'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional payment details'
  },
  previousBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'previous_balance'
  },
  newBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'new_balance'
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'failure_reason'
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'paid_at'
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'refunded_at'
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at'
  }
}, {
  tableName: 'payments',
  timestamps: true,
  indexes: [
    { fields: ['transaction_id'] },
    { fields: ['user_id'] },
    { fields: ['order_id'] },
    { fields: ['status'] },
    { fields: ['payment_method'] },
    { fields: ['gateway_reference'] },
    { fields: ['created_at'] }
  ]
});

// Hooks
// Must run on beforeValidate, not beforeCreate — Sequelize validates
// (including allowNull: false checks) before beforeCreate hooks run,
// so generating transactionId in beforeCreate is too late.
Payment.beforeValidate(async (payment) => {
  if (!payment.transactionId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    payment.transactionId = `TXN${timestamp}${random}`;
  }
});

Payment.beforeUpdate(async (payment) => {
  // Set timestamps based on status
  if (payment.changed('status')) {
    if (payment.status === 'Successful' && !payment.paidAt) {
      payment.paidAt = new Date();
      payment.verifiedAt = new Date();
    }
    if (payment.status === 'Refunded' && !payment.refundedAt) {
      payment.refundedAt = new Date();
    }
  }
});

module.exports = Payment;