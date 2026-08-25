const express = require('express');
const router = express.Router();
const { User, Order, Withdrawal, Payment } = require('../models');
const { verifyJWT, authorize } = require('../middleware/auth');

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

module.exports = router;