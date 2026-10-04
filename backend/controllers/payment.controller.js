// controllers/payment.controller.js
const { Payment, User, Withdrawal, PlatformSetting } = require('../models');
const { sequelize } = require('../config/database');
const crypto = require('crypto');
const axios = require('axios');
const { sendPaymentSuccessEmail, sendWithdrawalStatusEmail } = require('../utils/email');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const FLW_SECRET = process.env.FLUTTERWAVE_SECRET_KEY;
const FLW_BASE_URL = 'https://api.flutterwave.com/v3';

// @desc    Initialize payment (Paystack / Flutterwave / Manual)
// @route   POST /api/payments/initialize
// @access  Private
exports.initializePayment = async (req, res) => {
  try {
    const { amount, paymentGateway = 'Paystack' } = req.body;
    const user = req.user;

    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least ₦100'
      });
    }

    const isManual = paymentGateway === 'Manual' || paymentGateway === 'Bank Transfer';
    const resolvedGateway = isManual ? 'Manual' : paymentGateway;
    const paymentMethod = isManual ? 'Bank Transfer' : 'Card';

    const payment = await Payment.create({
      userId: user.id,
      type: 'Deposit',
      amount,
      paymentMethod,
      paymentGateway: resolvedGateway,
      status: 'Pending',
      previousBalance: user.walletBalance,
      description: isManual ? 'Manual bank transfer deposit' : null
    });

    // ---- Manual bank transfer ----
    if (isManual) {
      let stored = null;
      try {
        const row = await PlatformSetting.findOne({ where: { key: 'bank_details' } });
        stored = row?.value || null;
      } catch (e) {
        console.error('Failed to load bank_details setting:', e.message);
      }

      const bankDetails = {
        bankName: stored?.bankName || process.env.BANK_NAME || 'Not configured',
        accountName: stored?.accountName || process.env.BANK_ACCOUNT_NAME || 'Not configured',
        accountNumber: stored?.accountNumber || process.env.BANK_ACCOUNT_NUMBER || 'Not configured',
        amount,
        reference: payment.transactionId,
        note: stored?.note || 'Use the reference as your transfer narration so we can match your payment.'
      };

      await payment.update({
        metadata: { bankDetails, instructions: bankDetails.note }
      });

      return res.status(200).json({
        success: true,
        message: 'Bank transfer initiated. Transfer the exact amount using the reference as narration.',
        data: {
          reference: payment.transactionId,
          paymentId: payment.id,
          bankDetails,
          status: 'Pending'
        }
      });
    }

    let response;

    if (paymentGateway === 'Paystack') {
      response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email: user.email,
          amount: amount * 100,
          reference: payment.transactionId,
          callback_url: `${process.env.FRONTEND_URL}/dashboard/add-funds?reference=${payment.transactionId}`,
          metadata: {
            userId: user.id,
            paymentId: payment.id,
            fullName: user.fullName
          }
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await payment.update({
        gatewayReference: response.data.data.reference
      });

      return res.status(200).json({
        success: true,
        message: 'Payment initialized',
        data: {
          authorizationUrl: response.data.data.authorization_url,
          accessCode: response.data.data.access_code,
          reference: payment.transactionId
        }
      });
    }

    if (paymentGateway === 'Flutterwave') {
      response = await axios.post(
        `${FLW_BASE_URL}/payments`,
        {
          tx_ref: payment.transactionId,
          amount,
          currency: 'NGN',
          redirect_url: `${process.env.FRONTEND_URL}/dashboard/add-funds?reference=${payment.transactionId}`,
          customer: {
            email: user.email,
            name: user.fullName
          },
          customizations: {
            title: 'WeBoost Wallet Top-up',
            description: 'Add funds to your WeBoost wallet'
          }
        },
        {
          headers: {
            Authorization: `Bearer ${FLW_SECRET}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await payment.update({
        gatewayReference: response.data.data.tx_ref
      });

      return res.status(200).json({
        success: true,
        message: 'Payment initialized',
        data: {
          paymentLink: response.data.data.link,
          reference: payment.transactionId
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Unsupported payment gateway'
    });
  } catch (error) {
    console.error('Initialize payment error:', error.response?.data || error);
    res.status(500).json({
      success: false,
      message: 'Error initializing payment',
      error: error.message
    });
  }
};

// @desc    Verify payment
// @route   GET /api/payments/verify/:reference
// @access  Private
exports.verifyPayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { reference } = req.params;

    const payment = await Payment.findOne({
      where: { transactionId: reference },
      transaction
    });

    if (!payment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status === 'Successful') {
      await transaction.rollback();
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        data: payment
      });
    }

    if (payment.paymentGateway === 'Paystack') {
      const verificationResponse = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
      );

      const data = verificationResponse.data.data;

      if (data.status === 'success') {
        const user = await User.findByPk(payment.userId, { transaction });
        const newBalance = parseFloat(user.walletBalance) + parseFloat(payment.amount);

        await user.update({ walletBalance: newBalance }, { transaction });
        await payment.update({
          status: 'Successful',
          newBalance,
          paidAt: new Date(),
          verifiedAt: new Date(),
          metadata: data
        }, { transaction });

        await transaction.commit();
        sendPaymentSuccessEmail(user.email, user.fullName, payment.amount);

        return res.status(200).json({
          success: true,
          message: 'Payment verified successfully',
          data: payment
        });
      }
    } else if (payment.paymentGateway === 'Flutterwave') {
      const verificationResponse = await axios.get(
        `${FLW_BASE_URL}/transactions/${reference}/verify`,
        { headers: { Authorization: `Bearer ${FLW_SECRET}` } }
      );

      const data = verificationResponse.data.data;

      if (data.status === 'successful') {
        const user = await User.findByPk(payment.userId, { transaction });
        const newBalance = parseFloat(user.walletBalance) + parseFloat(payment.amount);

        await user.update({ walletBalance: newBalance }, { transaction });
        await payment.update({
          status: 'Successful',
          newBalance,
          paidAt: new Date(),
          verifiedAt: new Date(),
          metadata: data
        }, { transaction });

        await transaction.commit();
        sendPaymentSuccessEmail(user.email, user.fullName, payment.amount);

        return res.status(200).json({
          success: true,
          message: 'Payment verified successfully',
          data: payment
        });
      }
    }

    await transaction.rollback();
    res.status(400).json({
      success: false,
      message: 'Payment verification failed'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Verify payment error:', error.response?.data || error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

// @desc    Paystack webhook
// @route   POST /api/payments/webhook/paystack
// @access  Public
exports.paystackWebhook = async (req, res) => {
  try {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const { reference } = event.data;
      const payment = await Payment.findOne({ where: { transactionId: reference } });

      if (payment && payment.status === 'Pending') {
        const transaction = await sequelize.transaction();
        try {
          const user = await User.findByPk(payment.userId, { transaction });
          const newBalance = parseFloat(user.walletBalance) + parseFloat(payment.amount);

          await user.update({ walletBalance: newBalance }, { transaction });
          await payment.update({
            status: 'Successful',
            newBalance,
            paidAt: new Date(),
            verifiedAt: new Date(),
            metadata: event.data
          }, { transaction });

          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
      }
    }

    if (['transfer.success', 'transfer.failed', 'transfer.reversed'].includes(event.event)) {
      const { transfer_code, reference } = event.data;
      const withdrawal = await Withdrawal.findOne({ where: { transferCode: transfer_code } });

      if (withdrawal) {
        const dbTransaction = await sequelize.transaction();
        let emailUser = null;
        let emailStatus = null;
        try {
          if (event.event === 'transfer.success' && withdrawal.status !== 'Completed') {
            await withdrawal.update({
              status: 'Completed',
              transactionReference: reference,
              completedAt: new Date()
            }, { transaction: dbTransaction });

            const user = await User.findByPk(withdrawal.userId, { transaction: dbTransaction });
            await user.update({
              totalWithdrawn: parseFloat(user.totalWithdrawn) + parseFloat(withdrawal.amount)
            }, { transaction: dbTransaction });
            emailUser = user;
            emailStatus = 'Completed';
          } else if (['transfer.failed', 'transfer.reversed'].includes(event.event) && withdrawal.status !== 'Rejected') {
            const user = await User.findByPk(withdrawal.userId, { transaction: dbTransaction });
            await user.update({
              walletBalance: parseFloat(user.walletBalance) + parseFloat(withdrawal.amount)
            }, { transaction: dbTransaction });

            await withdrawal.update({
              status: 'Rejected',
              adminNotes: `Paystack ${event.event}: transfer did not complete, refunded to wallet.`,
              rejectedAt: new Date()
            }, { transaction: dbTransaction });
            emailUser = user;
            emailStatus = 'Rejected';
          }

          await dbTransaction.commit();

          if (emailUser) {
            sendWithdrawalStatusEmail(emailUser.email, emailUser.fullName, {
              status: emailStatus,
              amount: withdrawal.amount,
              reason: emailStatus === 'Rejected' ? 'The bank transfer did not complete.' : undefined
            });
          }
        } catch (error) {
          await dbTransaction.rollback();
          throw error;
        }
      }
    }

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
};

// @desc    Get payment history
// @route   GET /api/payments
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;

    const { count, rows: payments } = await Payment.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history',
      error: error.message
    });
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message
    });
  }
};

// @desc    Admin approve manual bank transfer
// @route   POST /api/admin/payments/:id/approve
// @access  Admin
exports.approveManualPayment = async (req, res) => {
  const dbTransaction = await sequelize.transaction();
  try {
    const payment = await Payment.findByPk(req.params.id, { transaction: dbTransaction });

    if (!payment) {
      await dbTransaction.rollback();
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.paymentGateway !== 'Manual') {
      await dbTransaction.rollback();
      return res.status(400).json({ success: false, message: 'Only manual bank transfers can be approved this way' });
    }

    if (payment.status === 'Successful') {
      await dbTransaction.rollback();
      return res.status(200).json({ success: true, message: 'Payment already approved', data: payment });
    }

    if (payment.status !== 'Pending' && payment.status !== 'Processing') {
      await dbTransaction.rollback();
      return res.status(400).json({ success: false, message: `Cannot approve payment with status ${payment.status}` });
    }

    const user = await User.findByPk(payment.userId, { transaction: dbTransaction });
    if (!user) {
      await dbTransaction.rollback();
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newBalance = parseFloat(user.walletBalance) + parseFloat(payment.amount);

    await user.update({ walletBalance: newBalance }, { transaction: dbTransaction });
    await payment.update({
      status: 'Successful',
      newBalance,
      paidAt: new Date(),
      verifiedAt: new Date(),
      metadata: {
        ...(payment.metadata || {}),
        approvedBy: req.user.id,
        approvedAt: new Date().toISOString(),
        adminNote: req.body.note || null
      }
    }, { transaction: dbTransaction });

    await dbTransaction.commit();
    sendPaymentSuccessEmail(user.email, user.fullName, payment.amount);

    res.status(200).json({
      success: true,
      message: 'Manual deposit approved and wallet credited',
      data: payment
    });
  } catch (error) {
    await dbTransaction.rollback();
    console.error('Approve manual payment error:', error);
    res.status(500).json({ success: false, message: 'Error approving payment', error: error.message });
  }
};

// @desc    Admin reject manual bank transfer
// @route   POST /api/admin/payments/:id/reject
// @access  Admin
exports.rejectManualPayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.paymentGateway !== 'Manual') {
      return res.status(400).json({ success: false, message: 'Only manual bank transfers can be rejected this way' });
    }

    if (payment.status === 'Successful') {
      return res.status(400).json({ success: false, message: 'Cannot reject an already successful payment' });
    }

    if (payment.status === 'Failed' || payment.status === 'Cancelled') {
      return res.status(200).json({ success: true, message: 'Payment already rejected', data: payment });
    }

    await payment.update({
      status: 'Failed',
      failureReason: req.body.reason || 'Bank transfer not received or details did not match',
      metadata: {
        ...(payment.metadata || {}),
        rejectedBy: req.user.id,
        rejectedAt: new Date().toISOString(),
        reason: req.body.reason || null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Manual deposit rejected',
      data: payment
    });
  } catch (error) {
    console.error('Reject manual payment error:', error);
    res.status(500).json({ success: false, message: 'Error rejecting payment', error: error.message });
  }
};

// @desc    Get platform bank details for manual deposits
// @route   GET /api/payments/bank-details
// @access  Private
exports.getBankDetails = async (req, res) => {
  try {
    let stored = null;
    try {
      const row = await PlatformSetting.findOne({ where: { key: 'bank_details' } });
      stored = row?.value || null;
    } catch (e) {
      console.error('Failed to load bank_details setting:', e.message);
    }

    const data = {
      bankName: stored?.bankName || process.env.BANK_NAME || '',
      accountName: stored?.accountName || process.env.BANK_ACCOUNT_NAME || '',
      accountNumber: stored?.accountNumber || process.env.BANK_ACCOUNT_NUMBER || '',
      note: stored?.note || 'Use the payment reference as your transfer narration.'
    };

    const configured = Boolean(
      data.bankName && data.accountName && data.accountNumber
    );

    res.status(200).json({
      success: true,
      data: { ...data, configured }
    });
  } catch (error) {
    console.error('Get bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bank details'
    });
  }
};