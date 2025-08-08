const express = require('express');
const router = express.Router();
const { 
  addToWishlist, 
  getWishlist, 
  updateWishlistItem, 
  removeFromWishlist, 
  clearWishlist 
} = require('../controllers/wishlistController');
const { authenticateToken } = require('../middleware/auth');

// All wishlist routes require authentication
router.use(authenticateToken);

// POST /wishlist/add - Add item to wishlist
router.post('/add', addToWishlist);

// GET /wishlist - Get user's wishlist
router.get('/', getWishlist);

// DELETE /wishlist/clear - Clear user's wishlist
router.delete('/clear', clearWishlist);

// PUT /wishlist/:wishlistItemId - Update wishlist item quantity
router.put('/:wishlistItemId', updateWishlistItem);

// DELETE /wishlist/:wishlistItemId - Remove item from wishlist
router.delete('/:wishlistItemId', removeFromWishlist);

module.exports = router; 