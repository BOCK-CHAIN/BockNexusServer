const express = require('express');
const router = express.Router();
const { 
    getAllProducts,
    getProductById,
    getProductsByCategoryId,
    getRandomProducts
} = require('../controllers/productController');

// GET /product - Get all products
router.get('/', getAllProducts);

// GET /product/random-products - Get random products
router.get('/random-products', getRandomProducts);

// GET /product/:productId - Get single product by ID
router.get('/:productId', getProductById);

// GET /product/category/:categoryId - Get products by category
router.get('/category/:categoryId', getProductsByCategoryId);

module.exports = router;
