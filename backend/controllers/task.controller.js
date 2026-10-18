// controllers/task.controller.js
const { Task, Order, User, LinkedAccount } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { sendTaskVerifiedEmail } = require('../utils/email');
const { uploadProofImage } = require('../utils/cloudinary');

// @desc    Get available tasks, grouped by order
// @route   GET /api/tasks/available
// @access  Private (Task User only)
exports.getAvailableTasks = async (req, res) => {
  try {
    const { page = 1, limit = 20, platform, taskType } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const linkedAccounts = await LinkedAccount.findAll({
      where: { userId, isActive: true },
      attributes: ['platform']
    });
    const linkedPlatforms = linkedAccounts.map((acc) => acc.platform);

    const ownTaskOrderIds = await Task.findAll({
      where: { userId },
      attributes: ['orderId'],
      group: ['orderId']
    });
    const excludedOrderIds = ownTaskOrderIds.map((t) => t.orderId);

    const whereClause = {
      status: 'Available',
      userId: null,
      clientId: { [Op.ne]: userId }
    };

    if (linkedPlatforms.length > 0) {
      whereClause.platform = { [Op.in]: linkedPlatforms };
    }
    if (platform) whereClause.platform = platform;
    if (taskType) whereClause.taskType = taskType;
    if (excludedOrderIds.length > 0) {
      whereClause.orderId = { [Op.notIn]: excludedOrderIds };
    }

    const groups = await Task.findAll({
      where: whereClause,
      attributes: [
        'orderId',
        'platform',
        'taskType',
        'targetUrl',
        'reward',
        [sequelize.fn('COUNT', sequelize.col('id')), 'availableCount']
      ],
      group: ['orderId', 'platform', 'taskType', 'targetUrl', 'reward'],
      order: [[sequelize.literal('availableCount'), 'DESC']],
      limit: parseInt(limit),
      offset
    });

    const totalGroups = groups.length;

    res.status(200).json({
      success: true,
      data: groups,
      pagination: {
        total: totalGroups,
        page: parseInt(page),
        pages: Math.ceil(totalGroups / limit) || 1
      }
    });
  } catch (error) {
    console.error('Get available tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available tasks',
      error: error.message
    });
  }
};

// @desc    Claim one open task slot from a specific order
// @route   POST /api/tasks/claim/:orderId
// @access  Private (Task User only)
exports.claimTaskFromOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const task = await Task.findOne({
      where: { orderId, status: 'Available', userId: null },
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!task) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No open slots left on this order.'
      });
    }

    if (task.clientId === userId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'You cannot complete tasks on your own order.'
      });
    }

    const linkedAccount = await LinkedAccount.findOne({
      where: { userId, platform: task.platform, isActive: true },
      transaction
    });

    if (!linkedAccount) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Please link your ${task.platform} account first`
      });
    }

    const alreadyOnOrder = await Task.findOne({
      where: { orderId, userId },
      transaction
    });

    if (alreadyOnOrder) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'You can only complete one task per order.'
      });
    }

    await task.update(
      {
        userId,
        status: 'Assigned',
        assignedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Task claimed successfully',
      data: task
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Claim task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error claiming task',
      error: error.message
    });
  }
};

// @desc    Get my tasks
// @route   GET /api/tasks/my-tasks
// @access  Private
exports.getMyTasks = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, platform } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    if (status) whereClause.status = status;
    if (platform) whereClause.platform = platform;

    const { count, rows: tasks } = await Task.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['orderId', 'platform', 'service']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

// @desc    Start/Accept a task
// @route   POST /api/tasks/:id/start
// @access  Private (Task User only)
exports.startTask = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    const task = await Task.findByPk(taskId, { transaction });

    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.status !== 'Available') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Task is not available'
      });
    }

    const linkedAccount = await LinkedAccount.findOne({
      where: {
        userId,
        platform: task.platform,
        isActive: true
      },
      transaction
    });

    if (!linkedAccount) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Please link your ${task.platform} account first`
      });
    }

    const alreadyOnOrder = await Task.findOne({
      where: { orderId: task.orderId, userId },
      transaction
    });

    if (alreadyOnOrder) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'You can only complete one task per order.'
      });
    }

    await task.update(
      {
        userId,
        status: 'Assigned',
        assignedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Task started successfully',
      data: task
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Start task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting task',
      error: error.message
    });
  }
};

// @desc    Submit task proof (screenshot via Cloudinary)
// @route   POST /api/tasks/:id/submit
// @access  Private (Task User only)
exports.submitTask = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const proofText = req.body?.proofText || null;

    const task = await Task.findOne({
      where: { id: taskId, userId },
      transaction
    });

    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Task not found or not assigned to you'
      });
    }

    if (!['Assigned', 'In Progress'].includes(task.status)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Task cannot be submitted in current status'
      });
    }

    let proofUrl = null;
    if (req.file && req.file.buffer) {
      try {
        const result = await uploadProofImage(req.file);
        proofUrl = result.secure_url;
      } catch (uploadErr) {
        await transaction.rollback();
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(500).json({
          success: false,
          message: uploadErr.message || 'Failed to upload proof image'
        });
      }
    }

    if (task.requiresProof && !proofUrl && !proofText) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'A screenshot proof image is required for this task'
      });
    }

    const nextStatus = task.autoVerify ? 'Completed' : 'Pending Verification';
    const nextVerification = task.autoVerify ? 'Verified' : 'Pending';

    await task.update(
      {
        status: nextStatus,
        proofUrl: proofUrl || task.proofUrl,
        proofText,
        submittedAt: new Date(),
        verificationStatus: nextVerification
      },
      { transaction }
    );

    if (task.autoVerify) {
      const user = await User.findByPk(userId, { transaction });
      if (user) {
        await user.update(
          {
            walletBalance:
              parseFloat(user.walletBalance) + parseFloat(task.reward),
            totalEarnings:
              parseFloat(user.totalEarnings) + parseFloat(task.reward),
            tasksCompleted: (user.tasksCompleted || 0) + 1
          },
          { transaction }
        );
      }

      const order = await Order.findByPk(task.orderId, { transaction });
      if (order) {
        await order.update(
          { quantityDelivered: (order.quantityDelivered || 0) + 1 },
          { transaction }
        );
      }

      await task.update({ completedAt: new Date() }, { transaction });
    }

    await transaction.commit();

    const updated = await Task.findByPk(taskId);

    return res.status(200).json({
      success: true,
      message: task.autoVerify
        ? 'Task completed and reward credited'
        : 'Task submitted for verification',
      data: updated || task
    });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (_) {}
    console.error('Submit task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting task',
      error: error.message
    });
  }
};

// @desc    Get tasks pending verification for the client's own orders
// @route   GET /api/tasks/pending-verification
// @access  Private (Client only)
exports.getPendingVerificationTasks = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: tasks } = await Task.findAndCountAll({
      where: {
        clientId: req.user.id,
        status: 'Pending Verification'
      },
      limit: parseInt(limit),
      offset,
      order: [['submittedAt', 'ASC']],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['orderId', 'platform', 'service']
        },
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get pending verification tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks pending verification',
      error: error.message
    });
  }
};

// @desc    Verify task (Admin/Client)
// @route   POST /api/tasks/:id/verify
// @access  Private (Admin/Client)
exports.verifyTask = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const taskId = req.params.id;
    const { approved, verificationNotes } = req.body;

    const task = await Task.findByPk(taskId, { transaction });

    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.status !== 'Pending Verification') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Task is not pending verification'
      });
    }

    if (approved) {
      await task.update(
        {
          status: 'Completed',
          verificationStatus: 'Verified',
          verifiedAt: new Date(),
          verificationNotes: verificationNotes || null,
          completedAt: new Date()
        },
        { transaction }
      );

      const user = await User.findByPk(task.userId, { transaction });
      if (user) {
        await user.update(
          {
            walletBalance:
              parseFloat(user.walletBalance) + parseFloat(task.reward),
            totalEarnings:
              parseFloat(user.totalEarnings) + parseFloat(task.reward),
            tasksCompleted: (user.tasksCompleted || 0) + 1
          },
          { transaction }
        );

        sendTaskVerifiedEmail(user.email, user.fullName, {
          approved: true,
          reward: task.reward,
          platform: task.platform
        });
      }

      const order = await Order.findByPk(task.orderId, { transaction });
      if (order) {
        await order.update(
          { quantityDelivered: (order.quantityDelivered || 0) + 1 },
          { transaction }
        );
      }
    } else {
      await task.update(
        {
          status: 'Rejected',
          verificationStatus: 'Rejected',
          verifiedAt: new Date(),
          verificationNotes: verificationNotes || null
        },
        { transaction }
      );

      const user = await User.findByPk(task.userId, { transaction });
      if (user) {
        sendTaskVerifiedEmail(user.email, user.fullName, {
          approved: false,
          reason: verificationNotes,
          platform: task.platform
        });
      }
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: approved ? 'Task approved and reward credited' : 'Task rejected',
      data: task
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Verify task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying task',
      error: error.message
    });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
exports.getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Task.findAll({
      where: { userId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalTasks'],
        [sequelize.fn('SUM', sequelize.col('reward')), 'totalEarnings'],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal("CASE WHEN status = 'Completed' THEN 1 END")
          ),
          'completedTasks'
        ],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal(
              "CASE WHEN status = 'Pending Verification' THEN 1 END"
            )
          ),
          'pendingTasks'
        ],
        [
          sequelize.fn(
            'COUNT',
            sequelize.literal("CASE WHEN status = 'In Progress' THEN 1 END")
          ),
          'inProgressTasks'
        ]
      ],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// @desc    Cancel/Abandon task
// @route   PUT /api/tasks/:id/cancel
// @access  Private
exports.cancelTask = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      transaction
    });

    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (!['Assigned', 'In Progress'].includes(task.status)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Only assigned or in-progress tasks can be cancelled'
      });
    }

    await task.update(
      {
        status: 'Available',
        userId: null,
        assignedAt: null,
        startedAt: null,
        expiresAt: null
      },
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Task cancelled successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Cancel task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling task',
      error: error.message
    });
  }
};

module.exports = exports;