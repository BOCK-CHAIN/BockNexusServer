import express from 'express';
import { createOrder, createTransaction, getOrdersByUserId } from '../controllers/order.js';

const router = express.Router();

router.post('/transaction', createTransaction)
router.get('/:userId', getOrdersByUserId)
router.post("/", createOrder)

export default router;  