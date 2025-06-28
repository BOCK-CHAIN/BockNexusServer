const express = require('express');
const router = express.Router();
const { 
  addToCart, 
  getCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

// All cart routes require authentication
router.use(authenticateToken);

// POST /cart/add - Add item to cart
router.post('/add', addToCart);

// GET /cart - Get user's cart
router.get('/', getCart);

// PUT /cart/:cartItemId - Update cart item quantity
router.put('/:cartItemId', updateCartItem);

// DELETE /cart/:cartItemId - Remove item from cart
router.delete('/:cartItemId', removeFromCart);

// DELETE /cart/clear - Clear user's cart
router.delete('/clear', clearCart);

module.exports = router; 