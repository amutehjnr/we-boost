const express = require('express');
const router = express.Router();
const { Withdrawal, User } = require('../models');
const { verifyJWT, authorize } = require('../middleware/auth');
const { sequelize } = require('../config/database');

// Request withdrawal
router.post('/', verifyJWT, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { amount, bankName, accountNumber, accountName } = req.body;
    const minAmount = parseFloat(process.env.MIN_WITHDRAWAL_AMOUNT) || 1000;

    if (!amount || amount < minAmount) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal amount is ₦${minAmount}`
      });
    }

    const user = await User.findByPk(req.user.id, { transaction });

    if (user.walletBalance < amount) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    // Deduct from wallet immediately
    await user.update({
      walletBalance: parseFloat(user.walletBalance) - amount
    }, { transaction });

    const withdrawal = await Withdrawal.create({
      userId: req.user.id,
      amount,
      bankName,
      accountNumber,
      accountName,
      previousBalance: parseFloat(user.walletBalance) + amount,
      newBalance: user.walletBalance
    }, { transaction });

    await transaction.commit();
    res.status(201).json({ success: true, data: withdrawal });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user withdrawals
router.get('/', verifyJWT, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const { count, rows } = await Withdrawal.findAndCountAll({
      where,
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
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get withdrawal by ID
router.get('/:id', verifyJWT, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }
    res.json({ success: true, data: withdrawal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel withdrawal (within 1 hour)
router.put('/:id/cancel', verifyJWT, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const withdrawal = await Withdrawal.findOne({
      where: { id: req.params.id, userId: req.user.id },
      transaction
    });

    if (!withdrawal) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'Pending') {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Can only cancel pending withdrawals' });
    }

    // Refund to wallet
    const user = await User.findByPk(req.user.id, { transaction });
    await user.update({
      walletBalance: parseFloat(user.walletBalance) + parseFloat(withdrawal.amount)
    }, { transaction });

    await withdrawal.update({ status: 'Cancelled' }, { transaction });
    await transaction.commit();

    res.json({ success: true, message: 'Withdrawal cancelled and refunded' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Approve/Process withdrawal
router.put('/:id/process', verifyJWT, authorize('admin'), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { status, adminNotes, transactionReference } = req.body;
    const withdrawal = await Withdrawal.findByPk(req.params.id, { transaction });

    if (!withdrawal) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    if (status === 'Completed') {
      await withdrawal.update({
        status: 'Completed',
        processedBy: req.user.id,
        adminNotes,
        transactionReference,
        completedAt: new Date()
      }, { transaction });

      const user = await User.findByPk(withdrawal.userId, { transaction });
      await user.update({
        totalWithdrawn: parseFloat(user.totalWithdrawn) + parseFloat(withdrawal.amount)
      }, { transaction });
    } else if (status === 'Rejected') {
      // Refund if rejected
      const user = await User.findByPk(withdrawal.userId, { transaction });
      await user.update({
        walletBalance: parseFloat(user.walletBalance) + parseFloat(withdrawal.amount)
      }, { transaction });

      await withdrawal.update({
        status: 'Rejected',
        processedBy: req.user.id,
        adminNotes,
        rejectedAt: new Date()
      }, { transaction });
    }

    await transaction.commit();
    res.json({ success: true, data: withdrawal });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
