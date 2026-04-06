const express = require('express');
const router = express.Router();
const { getUserAddresses, editAddress, addAddress, deleteAddress } = require('../controllers/addressController');
const { authenticateToken } = require('../middleware/auth');

// GET /address/user
router.get('/user', authenticateToken, getUserAddresses);

// GET /address/:userId (legacy)
router.get('/:userId', authenticateToken, getUserAddresses);

// POST /address
router.post('/', authenticateToken, addAddress);

// PUT /address/:id
router.put('/:id', authenticateToken, editAddress);

// DELETE /address/:id
router.delete('/:id', authenticateToken, deleteAddress);

module.exports = router;