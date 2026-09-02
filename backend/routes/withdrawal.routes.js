const express = require('express');
const router = express.Router();
const { Withdrawal, User } = require('../models');
const { verifyJWT, authorize } = require('../middleware/auth');
const { sequelize } = require('../config/database');
const axios = require('axios');
const { sendAdminWithdrawalAlertEmail } = require('../utils/email');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const paystackHeaders = { Authorization: `Bearer ${PAYSTACK_SECRET}` };

// List Nigerian banks (for the withdraw form's bank dropdown — Paystack
// needs an exact bank_code, not a free-text bank name, to send a transfer)
router.get('/banks', verifyJWT, async (req, res) => {
  try {
    const response = await axios.get(`${PAYSTACK_BASE_URL}/bank?country=nigeria`, {
      headers: paystackHeaders
    });
    res.json({ success: true, data: response.data.data });
  } catch (error) {
    console.error('Fetch banks error:', error?.response?.data || error);
    res.status(500).json({ success: false, message: 'Failed to load bank list' });
  }
});

// Verify an account number actually belongs to the name given, before
// accepting a withdrawal request — catches typos before money is sent
// to the wrong account.
router.post('/resolve-account', verifyJWT, async (req, res) => {
  try {
    const { accountNumber, bankCode } = req.body;
    const response = await axios.get(`${PAYSTACK_BASE_URL}/bank/resolve`, {
      params: { account_number: accountNumber, bank_code: bankCode },
      headers: paystackHeaders
    });
    res.json({ success: true, data: response.data.data });
  } catch (error) {
    console.error('Resolve account error:', error?.response?.data || error);
    res.status(400).json({
      success: false,
      message: error?.response?.data?.message || 'Could not verify this account number'
    });
  }
});

// Request withdrawal
router.post('/', verifyJWT, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { amount, bankName, bankCode, accountNumber, accountName } = req.body;
    const minAmount = parseFloat(process.env.MIN_WITHDRAWAL_AMOUNT) || 1000;

    if (!amount || amount < minAmount) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal amount is ₦${minAmount}`
      });
    }

    const user = await User.findByPk(req.user.id, { transaction });

    if (!user.isVerified) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before requesting a withdrawal. Check your inbox for the verification link.'
      });
    }

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
      bankCode,
      accountNumber,
      accountName,
      previousBalance: parseFloat(user.walletBalance) + amount,
      newBalance: user.walletBalance
    }, { transaction });

    await transaction.commit();

    sendAdminWithdrawalAlertEmail({
      fullName: user.fullName,
      amount,
      bankName,
      accountNumber
    });

    res.status(201).json({ success: true, data: withdrawal });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get ALL withdrawals across every user
router.get('/admin/all', verifyJWT, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Withdrawal.findAndCountAll({
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

// Admin: Initiate a real bank transfer via Paystack for an approved withdrawal.
// Does NOT mark the withdrawal Completed here — that only happens once
// Paystack's webhook confirms transfer.success, since a transfer can still
// fail after being initiated. Reject still works exactly as before (no
// money was ever sent, so it's a simple refund).
router.put('/:id/process', verifyJWT, authorize('admin'), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { status, adminNotes } = req.body;
    const withdrawal = await Withdrawal.findByPk(req.params.id, { transaction });

    if (!withdrawal) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    if (status === 'Rejected') {
      // Refund since nothing was ever sent
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

      await transaction.commit();
      return res.json({ success: true, data: withdrawal });
    }

    if (status !== 'Completed') {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    if (!withdrawal.bankCode) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'This withdrawal has no bank code on file (submitted before bank selection was added) — cannot send an automated transfer.'
      });
    }

    // Create (or reuse) a Paystack transfer recipient for this account
    let recipientCode = withdrawal.paystackRecipientCode;
    if (!recipientCode) {
      const recipientRes = await axios.post(`${PAYSTACK_BASE_URL}/transferrecipient`, {
        type: 'nuban',
        name: withdrawal.accountName,
        account_number: withdrawal.accountNumber,
        bank_code: withdrawal.bankCode,
        currency: 'NGN'
      }, { headers: paystackHeaders });

      recipientCode = recipientRes.data.data.recipient_code;
    }

    // Initiate the actual transfer
    const transferRes = await axios.post(`${PAYSTACK_BASE_URL}/transfer`, {
      source: 'balance',
      amount: Math.round(parseFloat(withdrawal.netAmount) * 100), // kobo
      recipient: recipientCode,
      reason: `WeBoost withdrawal ${withdrawal.withdrawalId}`
    }, { headers: paystackHeaders });

    const transferData = transferRes.data.data;

    await withdrawal.update({
      status: 'Processing',
      processedBy: req.user.id,
      adminNotes,
      paystackRecipientCode: recipientCode,
      transferCode: transferData.transfer_code,
      approvedAt: new Date()
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      data: withdrawal,
      requiresOtp: transferData.status === 'otp',
      message: transferData.status === 'otp'
        ? 'Transfer initiated — OTP required to finalize. Check the phone/email on the Paystack account.'
        : 'Transfer initiated. It will be marked Completed automatically once Paystack confirms.'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Process withdrawal error:', error?.response?.data || error);
    res.status(500).json({
      success: false,
      message: error?.response?.data?.message || 'Failed to initiate transfer'
    });
  }
});

// Admin: Finalize a transfer that Paystack flagged as requiring OTP
router.post('/:id/finalize-transfer', verifyJWT, authorize('admin'), async (req, res) => {
  try {
    const { otp } = req.body;
    const withdrawal = await Withdrawal.findByPk(req.params.id);

    if (!withdrawal || !withdrawal.transferCode) {
      return res.status(404).json({ success: false, message: 'No pending transfer found for this withdrawal' });
    }

    const finalizeRes = await axios.post(`${PAYSTACK_BASE_URL}/transfer/finalize_transfer`, {
      transfer_code: withdrawal.transferCode,
      otp
    }, { headers: paystackHeaders });

    res.json({
      success: true,
      message: 'Transfer finalized. It will be marked Completed once Paystack confirms.',
      data: finalizeRes.data.data
    });
  } catch (error) {
    console.error('Finalize transfer error:', error?.response?.data || error);
    res.status(400).json({
      success: false,
      message: error?.response?.data?.message || 'Failed to finalize transfer — check the OTP and try again'
    });
  }
});

module.exports = router;