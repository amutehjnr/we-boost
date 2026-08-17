const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyJWT } = require('../middleware/auth');

router.post('/initialize', verifyJWT, paymentController.initializePayment);
router.get('/verify/:reference', verifyJWT, paymentController.verifyPayment);
router.get('/', verifyJWT, paymentController.getPaymentHistory);
router.get('/:id', verifyJWT, paymentController.getPayment);
router.post('/webhook/paystack', paymentController.paystackWebhook);

module.exports = router;