const express = require('express');
const router = express.Router();
const { getUserAddresses } = require('../controllers/addressController');
const { authenticateToken } = require('../middleware/auth');

// GET /address/:userId
router.get('/:userId', authenticateToken,  getUserAddresses);

module.exports = router;