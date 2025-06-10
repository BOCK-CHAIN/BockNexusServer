const express = require('express');
const router = express.Router();
const { createTransaction, createOrder, getOrdersByUserId } = require('../controllers/orderController');

// POST /orders/transaction
router.post('/transaction', createTransaction);
// POST /orders/create
router.post('/create', createOrder);
// GET /orders/user/:userId
router.get('/user/:userId', getOrdersByUserId);

module.exports = router;
