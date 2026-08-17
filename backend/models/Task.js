// models/Task.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  taskId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    field: 'task_id'
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'order_id',
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // Null until someone picks the task
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'client_id',
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'The client who created the order'
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
  taskType: {
    type: DataTypes.ENUM(
      'Follow', 
      'Like', 
      'Comment', 
      'Share', 
      'Stream',
      'Subscribe',
      'Retweet',
      'View'
    ),
    allowNull: false,
    field: 'task_type'
  },
  targetUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'target_url',
    comment: 'The URL or username to interact with'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Instructions for the task'
  },
  reward: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Amount user earns for completing this task'
  },
  status: {
    type: DataTypes.ENUM('Available', 'Assigned', 'In Progress', 'Pending Verification', 'Completed', 'Rejected', 'Cancelled'),
    defaultValue: 'Available'
  },
  proofUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'proof_url',
    comment: 'Screenshot or proof URL submitted by user'
  },
  proofText: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'proof_text',
    comment: 'Text proof like comment text or username'
  },
  verificationStatus: {
    type: DataTypes.ENUM('Pending', 'Verified', 'Failed'),
    defaultValue: 'Pending',
    field: 'verification_status'
  },
  verificationNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'verification_notes'
  },
  assignedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'assigned_at'
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'started_at'
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'submitted_at'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at',
    comment: 'Task expiration time if not completed'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason'
  },
  attemptCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'attempt_count',
    comment: 'Number of times user attempted this task'
  },
  maxAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    field: 'max_attempts'
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Higher priority tasks shown first'
  },
  requiresProof: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'requires_proof'
  },
  autoVerify: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'auto_verify',
    comment: 'Auto-verify using API if available'
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  indexes: [
    { fields: ['task_id'] },
    { fields: ['order_id'] },
    { fields: ['user_id'] },
    { fields: ['client_id'] },
    { fields: ['status'] },
    { fields: ['platform'] },
    { fields: ['task_type'] },
    { fields: ['created_at'] }
  ]
});

// Hooks
Task.beforeCreate(async (task) => {
  // Generate unique task ID
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  task.taskId = `TASK${timestamp}${random}`;
  
  // Set expiration (24 hours from creation if assigned)
  if (task.status === 'Assigned') {
    task.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
});

Task.beforeUpdate(async (task) => {
  // Set timestamps based on status changes
  if (task.changed('status')) {
    if (task.status === 'Assigned' && !task.assignedAt) {
      task.assignedAt = new Date();
      task.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    if (task.status === 'In Progress' && !task.startedAt) {
      task.startedAt = new Date();
    }
    if (task.status === 'Pending Verification' && !task.submittedAt) {
      task.submittedAt = new Date();
    }
    if (task.status === 'Completed' && !task.completedAt) {
      task.completedAt = new Date();
    }
  }
});

module.exports = Task;