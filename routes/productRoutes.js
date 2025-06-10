const express = require('express');
const router = express.Router();
const { getProductsByCategoryId } = require('../controllers/productController');

// GET /product/:categoryId
router.get('/:categoryId', getProductsByCategoryId);

module.exports = router;
