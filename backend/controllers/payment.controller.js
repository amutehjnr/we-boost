// controllers/payment.controller.js
const { Payment, User } = require('../models');
const { sequelize } = require('../config/database');
const crypto = require('crypto');
const axios = require('axios');

// Paystack configuration
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Flutterwave configuration
const FLW_SECRET = process.env.FLUTTERWAVE_SECRET_KEY;
const FLW_BASE_URL = 'https://api.flutterwave.com/v3';

// @desc    Initialize payment (Paystack/Flutterwave)
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

    // Create payment record
    const payment = await Payment.create({
      userId: user.id,
      type: 'Deposit',
      amount,
      paymentMethod: 'Card',
      paymentGateway,
      status: 'Pending',
      previousBalance: user.walletBalance
    });

    let response;

    if (paymentGateway === 'Paystack') {
      // Initialize Paystack transaction
      response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email: user.email,
          amount: amount * 100, // Convert to kobo
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
    } else if (paymentGateway === 'Flutterwave') {
      // Initialize Flutterwave transaction
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

    let verificationResponse;

    if (payment.paymentGateway === 'Paystack') {
      // Verify with Paystack
      verificationResponse = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`
          }
        }
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

        return res.status(200).json({
          success: true,
          message: 'Payment verified successfully',
          data: payment
        });
      }
    } else if (payment.paymentGateway === 'Flutterwave') {
      // Verify with Flutterwave
      verificationResponse = await axios.get(
        `${FLW_BASE_URL}/transactions/${reference}/verify`,
        {
          headers: {
            Authorization: `Bearer ${FLW_SECRET}`
          }
        }
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
      const { reference, amount, customer } = event.data;
      
      const payment = await Payment.findOne({
        where: { transactionId: reference }
      });

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

module.exports = exports;