const express = require('express');
const router = express.Router();
const { createTransaction, createOrder, getOrdersByUserId, placeOrder } = require('../controllers/orderController');
const { getUserOrders } = require('../controllers/orderViewController');
const { authenticateToken } = require('../middleware/auth');

// POST /orders/transaction
router.post('/transaction', createTransaction);

// POST /orders/create (Razorpay verified)
router.post('/create', createOrder);

// POST /orders/place (direct, no payment gateway)
router.post('/place', authenticateToken, placeOrder);

// GET /orders/user/:userId
router.get('/user/:userId', getOrdersByUserId);

// GET /orders/my-orders
router.get('/my-orders', authenticateToken, getUserOrders);


module.exports = router;