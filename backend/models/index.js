// models/index.js
const User = require('./User');
const Order = require('./Order');
const Task = require('./Task');
const Payment = require('./Payment');
const Withdrawal = require('./Withdrawal');
const LinkedAccount = require('./LinkedAccount');
const Conversation = require('./Conversation');
const Message = require('./Message');

// User-Order Associations
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'client' });

// Order-Task Associations
Order.hasMany(Task, { foreignKey: 'orderId', as: 'tasks' });
Task.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// User-Task Associations (for users completing tasks)
User.hasMany(Task, { foreignKey: 'userId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'userId', as: 'assignedUser' });

// Client-Task Associations (for clients who created the order)
User.hasMany(Task, { foreignKey: 'clientId', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

// User-Payment Associations
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order-Payment Associations
Order.hasMany(Payment, { foreignKey: 'orderId', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// User-Withdrawal Associations
User.hasMany(Withdrawal, { foreignKey: 'userId', as: 'withdrawals' });
Withdrawal.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Admin who processed withdrawal
Withdrawal.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

// User-LinkedAccount Associations
User.hasMany(LinkedAccount, { foreignKey: 'userId', as: 'linkedAccounts' });
LinkedAccount.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Conversation-Message Associations
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

// User-Conversation Associations
User.hasMany(Conversation, { foreignKey: 'userId', as: 'conversations' });
Conversation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Conversation.belongsTo(User, { foreignKey: 'assignedAdminId', as: 'assignedAdmin' });

module.exports = {
  User,
  Order,
  Task,
  Payment,
  Withdrawal,
  LinkedAccount,
  Conversation,
  Message
};