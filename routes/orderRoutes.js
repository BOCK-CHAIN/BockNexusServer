const express = require('express');
const router = express.Router();
const { createTransaction, createOrder, getOrdersByUserId } = require('../controllers/orderController');
const { getUserOrders } = require('../controllers/orderViewController');
const { authenticateToken } = require('../middleware/auth');

// POST /orders/transaction
router.post('/transaction', createTransaction);

// POST /orders/create
router.post('/create', createOrder);

// GET /orders/user/:userId
router.get('/user/:userId', getOrdersByUserId);

// GET /orders/my-orders
router.get('/my-orders', authenticateToken, getUserOrders);


module.exports = router;