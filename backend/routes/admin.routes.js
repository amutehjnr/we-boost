const express = require('express');
const router = express.Router();
const { verifyJWT, authorize } = require('../middleware/auth');
const { User, Order, Withdrawal, Payment, Task, PlatformSetting } = require('../models');
const paymentController = require('../controllers/payment.controller');

// Every route here requires a logged-in admin
router.use(verifyJWT, authorize('admin'));

// Platform-wide overview stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalClients, totalTaskUsers, totalOrders, pendingWithdrawals, totalPayments] =
      await Promise.all([
        User.count(),
        User.count({ where: { isClient: true } }),
        User.count({ where: { isClient: false } }),
        Order.count(),
        Withdrawal.count({ where: { status: 'Pending' } }),
        Payment.sum('amount', { where: { status: 'Successful' } })
      ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalClients,
        totalTaskUsers,
        totalOrders,
        pendingWithdrawals,
        totalRevenue: totalPayments || 0
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// List all users, with basic filtering
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (role) where.role = role;
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a user's status/role (suspend, activate, promote/demote admin)
router.put('/users/:id', async (req, res) => {
  try {
    const { isActive, isSuspended, role } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent an admin from accidentally locking themselves out
    if (user.id === req.user.id && (isActive === false || isSuspended === true || (role && role !== 'admin'))) {
      return res.status(400).json({ success: false, message: "You can't restrict your own admin account." });
    }

    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (isSuspended !== undefined) updates.isSuspended = isSuspended;
    if (role !== undefined) updates.role = role;

    await user.update(updates);

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// List all orders platform-wide
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'client', attributes: ['id', 'fullName', 'email'] }
      ]
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    console.error('Admin list orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// List all tasks platform-wide
router.get('/tasks', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Task.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Order, as: 'order', attributes: ['orderId'] },
        { model: User, as: 'assignedUser', attributes: ['id', 'fullName', 'email'] },
        { model: User, as: 'client', attributes: ['id', 'fullName', 'email'] }
      ]
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    console.error('Admin list tasks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// List all payments platform-wide
router.get('/payments', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Payment.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email'] }
      ]
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    console.error('Admin list payments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---- Bank details settings (manual deposits) ----
router.get('/settings/bank', async (req, res) => {
  try {
    const row = await PlatformSetting.findOne({ where: { key: 'bank_details' } });
    const value = row?.value || {
      bankName: process.env.BANK_NAME || '',
      accountName: process.env.BANK_ACCOUNT_NAME || '',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '',
      note: 'Use the reference as your transfer narration so we can match your payment.'
    };
    res.json({ success: true, data: value });
  } catch (error) {
    console.error('Get bank settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/settings/bank', async (req, res) => {
  try {
    const { bankName, accountName, accountNumber, note } = req.body;

    if (!bankName || !accountName || !accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'bankName, accountName and accountNumber are required'
      });
    }

    const value = {
      bankName: String(bankName).trim(),
      accountName: String(accountName).trim(),
      accountNumber: String(accountNumber).trim(),
      note: note
        ? String(note).trim()
        : 'Use the reference as your transfer narration so we can match your payment.',
      updatedBy: req.user.id,
      updatedAt: new Date().toISOString()
    };

    const [row, created] = await PlatformSetting.findOrCreate({
      where: { key: 'bank_details' },
      defaults: { key: 'bank_details', value }
    });

    if (!created) {
      await row.update({ value });
    }

    res.json({ success: true, message: 'Bank details updated', data: value });
  } catch (error) {
    console.error('Update bank settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve pending manual bank transfer deposit
router.post('/payments/:id/approve', paymentController.approveManualPayment);

// Reject pending manual bank transfer deposit
router.post('/payments/:id/reject', paymentController.rejectManualPayment);

module.exports = router;