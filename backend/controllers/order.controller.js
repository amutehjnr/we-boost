// controllers/order.controller.js
const { Order, Task, User, Payment } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Service rates configuration
const SERVICE_RATES = {
  Basic: parseFloat(process.env.SERVICE_RATE_BASIC) || 10000,
  Moderate: parseFloat(process.env.SERVICE_RATE_MODERATE) || 25000,
  High: parseFloat(process.env.SERVICE_RATE_HIGH) || 50000
};

// The order form sends generic category names (plural, platform-agnostic).
// This maps each one to the actual action a task-doer performs, per
// platform, so the correct TASK_RATES entry is found and the task shows
// the right instruction.
const CATEGORY_TO_ACTION = (category, platform) => {
  switch (category) {
    case 'Followers':
      return platform === 'YouTube' ? 'Subscribe' : 'Follow';
    case 'Likes':
      return 'Like';
    case 'Views':
      return 'View';
    case 'Comments':
      return 'Comment';
    case 'Streams':
      return 'Stream';
    case 'Shares':
      return platform === 'Twitter' ? 'Retweet' : 'Share';
    default:
      return category;
  }
};

// Task reward rates (what users earn per action)
const TASK_RATES = {
  Facebook: {
    Like: parseFloat(process.env.RATE_FACEBOOK_LIKE) || 10,
    Follow: parseFloat(process.env.RATE_FACEBOOK_FOLLOW) || 20,
    Comment: parseFloat(process.env.RATE_FACEBOOK_COMMENT) || 25,
    Share: parseFloat(process.env.RATE_FACEBOOK_SHARE) || 30
  },
  Instagram: {
    Like: parseFloat(process.env.RATE_INSTAGRAM_LIKE) || 12,
    Follow: parseFloat(process.env.RATE_INSTAGRAM_FOLLOW) || 25,
    Comment: parseFloat(process.env.RATE_INSTAGRAM_COMMENT) || 30,
    Share: parseFloat(process.env.RATE_INSTAGRAM_SHARE) || 35
  },
  TikTok: {
    Like: parseFloat(process.env.RATE_TIKTOK_LIKE) || 15,
    Follow: parseFloat(process.env.RATE_TIKTOK_FOLLOW) || 30,
    Comment: parseFloat(process.env.RATE_TIKTOK_COMMENT) || 35,
    Share: parseFloat(process.env.RATE_TIKTOK_SHARE) || 40
  },
  Twitter: {
    Like: parseFloat(process.env.RATE_TWITTER_LIKE) || 10,
    Follow: parseFloat(process.env.RATE_TWITTER_FOLLOW) || 25,
    Comment: parseFloat(process.env.RATE_TWITTER_COMMENT) || 20,
    Retweet: parseFloat(process.env.RATE_TWITTER_RETWEET) || 30
  },
  YouTube: {
    Like: parseFloat(process.env.RATE_YOUTUBE_LIKE) || 20,
    Subscribe: parseFloat(process.env.RATE_YOUTUBE_SUBSCRIBE) || 40,
    Comment: parseFloat(process.env.RATE_YOUTUBE_COMMENT) || 30,
    Share: parseFloat(process.env.RATE_YOUTUBE_SHARE) || 35,
    View: 5
  },
  Spotify: {
    Stream: parseFloat(process.env.RATE_SPOTIFY_STREAM) || 15
  },
  Audiomack: {
    Stream: parseFloat(process.env.RATE_AUDIOMACK_STREAM) || 12
  },
  YoutubeMusic: {
    Stream: parseFloat(process.env.RATE_YOUTUBE_MUSIC_STREAM) || 18
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Client only)
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { platform, category, service, targetUrl, quantity } = req.body;
    const userId = req.user.id;

    // Validation
    if (!platform || !category || !service || !targetUrl || !quantity) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate quantity
    if (quantity < 100 || quantity > 10000000) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 100 and 10,000,000'
      });
    }

    // Calculate rate and total
    const rate = SERVICE_RATES[service];
    const totalAmount = (quantity / 1000) * rate;

    // Check user wallet balance
    const user = await User.findByPk(userId, { transaction });
    if (user.walletBalance < totalAmount) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance. Please add funds.'
      });
    }

    // Create order
    const order = await Order.create({
      userId,
      platform,
      category,
      service,
      targetUrl,
      quantity,
      rate,
      totalAmount,
      status: 'Processing'
    }, { transaction });

    // Deduct from wallet
    await user.update({
      walletBalance: parseFloat(user.walletBalance) - totalAmount,
      totalSpent: parseFloat(user.totalSpent) + totalAmount,
      ordersCreated: user.ordersCreated + 1
    }, { transaction });

    // Create payment record
    await Payment.create({
      userId,
      orderId: order.id,
      type: 'Order Payment',
      amount: totalAmount,
      paymentMethod: 'Wallet',
      paymentGateway: 'Internal',
      status: 'Successful',
      previousBalance: parseFloat(user.walletBalance) + totalAmount,
      newBalance: user.walletBalance,
      paidAt: new Date()
    }, { transaction });

    // Create tasks for the order — normalize the client-facing category
    // (e.g. "Followers") into the actual action a task-doer performs
    // (e.g. "Follow" or "Subscribe" on YouTube), so pricing and task
    // instructions are both correct.
    const actionType = CATEGORY_TO_ACTION(category, platform);
    const taskReward = TASK_RATES[platform]?.[actionType] || 10;
    const numberOfTasks = Math.ceil(quantity);

    // Create tasks in batches
    const tasks = [];
    for (let i = 0; i < numberOfTasks; i++) {
      tasks.push({
        orderId: order.id,
        clientId: userId,
        platform,
        taskType: actionType,
        targetUrl,
        reward: taskReward,
        status: 'Available'
      });
    }

    // Bulk create tasks
    await Task.bulkCreate(tasks, { transaction });

    // Update order status
    await order.update({ 
      status: 'In Progress',
      startedAt: new Date()
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// @desc    Get all orders for current user
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, platform } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    if (status) whereClause.status = status;
    if (platform) whereClause.platform = platform;

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'status'],
          required: false
        }
      ]
    });

    // Calculate stats for each order
    const ordersWithStats = orders.map(order => {
      const orderData = order.toJSON();
      const completedTasks = orderData.tasks?.filter(t => t.status === 'Completed').length || 0;
      const totalTasks = orderData.tasks?.length || 0;
      
      return {
        ...orderData,
        completedTasks,
        totalTasks,
        progressPercentage: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0
      };
    });

    res.status(200).json({
      success: true,
      data: ordersWithStats,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        {
          model: Task,
          as: 'tasks',
          limit: 50,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { cancellationReason } = req.body;
    
    const order = await Order.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      },
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!['Pending', 'Processing'].includes(order.status)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Only pending or processing orders can be cancelled'
      });
    }

    // Refund amount
    const user = await User.findByPk(req.user.id, { transaction });
    await user.update({
      walletBalance: parseFloat(user.walletBalance) + parseFloat(order.totalAmount)
    }, { transaction });

    // Create refund payment record
    await Payment.create({
      userId: req.user.id,
      orderId: order.id,
      type: 'Refund',
      amount: order.totalAmount,
      paymentMethod: 'Wallet',
      paymentGateway: 'Internal',
      status: 'Successful',
      previousBalance: parseFloat(user.walletBalance) - parseFloat(order.totalAmount),
      newBalance: user.walletBalance,
      description: `Refund for cancelled order ${order.orderId}`
    }, { transaction });

    // Cancel all associated tasks
    await Task.update(
      { status: 'Cancelled' },
      { 
        where: { 
          orderId: order.id,
          status: { [Op.in]: ['Available', 'Assigned'] }
        },
        transaction 
      }
    );

    // Update order
    await order.update({
      status: 'Cancelled',
      cancellationReason: cancellationReason || 'Cancelled by user'
    }, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
exports.getOrderStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Order.findAll({
      where: { userId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalSpent'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'Pending' THEN 1 END")), 'pendingOrders'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'Completed' THEN 1 END")), 'completedOrders']
      ],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

module.exports = exports;