// models/Withdrawal.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Withdrawal = sequelize.define('Withdrawal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  withdrawalId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    field: 'withdrawal_id'
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: parseFloat(process.env.MIN_WITHDRAWAL_AMOUNT) || 1000
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'NGN'
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'bank_name'
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'account_number'
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'account_name'
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Processing', 'Approved', 'Completed', 'Rejected', 'Cancelled'),
    defaultValue: 'Pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('Bank Transfer', 'Mobile Money', 'Crypto'),
    defaultValue: 'Bank Transfer',
    field: 'payment_method'
  },
  processingFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'processing_fee'
  },
  netAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'net_amount',
    comment: 'Amount after deducting fees'
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
  transactionReference: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'transaction_reference',
    comment: 'Bank transfer reference'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'admin_notes'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason'
  },
  processedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'processed_by',
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Admin who processed the withdrawal'
  },
  requestedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'requested_at'
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'approved_at'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  rejectedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'rejected_at'
  }
}, {
  tableName: 'withdrawals',
  timestamps: true,
  indexes: [
    { fields: ['withdrawal_id'] },
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
});

// Hooks
// Must run on beforeValidate, not beforeCreate — Sequelize validates
// (including allowNull: false checks) before beforeCreate hooks run,
// so generating withdrawalId in beforeCreate is too late.
Withdrawal.beforeValidate(async (withdrawal) => {
  if (!withdrawal.withdrawalId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    withdrawal.withdrawalId = `WTH${timestamp}${random}`;
  }

  // Calculate net amount (deduct processing fee if any)
  if (withdrawal.netAmount === undefined || withdrawal.netAmount === null) {
    withdrawal.netAmount = withdrawal.amount - withdrawal.processingFee;
  }
});

Withdrawal.beforeUpdate(async (withdrawal) => {
  // Set timestamps based on status
  if (withdrawal.changed('status')) {
    if (withdrawal.status === 'Approved' && !withdrawal.approvedAt) {
      withdrawal.approvedAt = new Date();
    }
    if (withdrawal.status === 'Completed' && !withdrawal.completedAt) {
      withdrawal.completedAt = new Date();
    }
    if (withdrawal.status === 'Rejected' && !withdrawal.rejectedAt) {
      withdrawal.rejectedAt = new Date();
    }
  }
});

module.exports = Withdrawal;