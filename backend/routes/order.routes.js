const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyJWT, isClient } = require('../middleware/auth');

router.post('/', verifyJWT, isClient, orderController.createOrder);
router.get('/', verifyJWT, orderController.getMyOrders);
router.get('/stats', verifyJWT, orderController.getOrderStats);
router.get('/:id', verifyJWT, orderController.getOrder);
router.put('/:id/cancel', verifyJWT, orderController.cancelOrder);

module.exports = router;