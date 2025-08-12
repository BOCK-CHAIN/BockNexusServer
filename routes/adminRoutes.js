const express = require('express');
const router = express.Router();
const {
    getAllProductsForAdmin,
    getProductForAdmin,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    getAllCategoriesForAdmin,
    getCategoryForAdmin,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/adminController');

// Product routes for React Admin
// GET /admin/products - Get all products (paginated)
router.get('/products', getAllProductsForAdmin);

// GET /admin/products/:id - Get single product
router.get('/products/:id', getProductForAdmin);

// POST /admin/products - Create new product
router.post('/products', createProduct);

// PUT /admin/products/:id - Update product
router.put('/products/:id', updateProduct);

// DELETE /admin/products/:id - Delete product
router.delete('/products/:id', deleteProduct);

// PUT /admin/products/:id/stock - Update product stock/quantity
router.put('/products/:id/stock', updateProductStock);

// Category routes for React Admin
// GET /admin/categories - Get all categories (paginated)
router.get('/categories', getAllCategoriesForAdmin);

// GET /admin/categories/:id - Get single category
router.get('/categories/:id', getCategoryForAdmin);

// POST /admin/categories - Create new category
router.post('/categories', createCategory);

// PUT /admin/categories/:id - Update category
router.put('/categories/:id', updateCategory);

// DELETE /admin/categories/:id - Delete category
router.delete('/categories/:id', deleteCategory);

module.exports = router; 