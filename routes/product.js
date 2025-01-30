import express from 'express';
import { getProductsByCategoryId } from '../controllers/product';

const router = express.Router();

router.post('/:categoryId', getProductsByCategoryId)

export default router;  