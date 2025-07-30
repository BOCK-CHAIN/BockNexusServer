const express = require('express');
const router = express.Router();
const { 
    getAllProducts,
    getProductById,
    getProductsByCategoryId,
    getRandomProducts,
    filterProducts,
    getFilterProducts,
    getBrandsByCategory,
    getColoursByCategory,
    getSizesByCategory,
    getSearchProducts
} = require('../controllers/productController');

// GET /product - Get all products
router.get('/', getAllProducts);

// GET /product/random-products - Get random products
router.get('/random-products', getRandomProducts);

// GET /product/filter - Filter products by category, color, size, brand, price range
router.get('/filter', getFilterProducts);

// GET /product/brands - Get available brands for a category
router.get('/brands', getBrandsByCategory);

// GET /product/colours - Get available colours for a category
router.get('/colours', getColoursByCategory);

// GET /product/sizes - Get available sizes for a category
router.get('/sizes', getSizesByCategory);

// GET /product/search - Search products by keyword
router.get('/search', getSearchProducts);

// GET /product/:productId - Get single product by ID
router.get('/:productId', getProductById);

// GET /product/category/:categoryId - Get products by category
router.get('/category/:categoryId', getProductsByCategoryId);

module.exports = router;
