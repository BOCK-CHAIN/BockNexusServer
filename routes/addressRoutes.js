const express = require('express');
const router = express.Router();
const { getUserAddresses, editAddress, addAddress } = require('../controllers/addressController');
const { authenticateToken } = require('../middleware/auth');

// GET /address/:userId
router.get('/:userId', authenticateToken,  getUserAddresses);

// POST /address
router.post('/', authenticateToken, addAddress);

// PUT /address/:id
router.put('/:id', authenticateToken, editAddress);

module.exports = router;