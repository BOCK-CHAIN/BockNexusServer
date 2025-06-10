const express = require('express');
const router = express.Router();
const { loginOrSignup } = require('../controllers/userController');

// POST /users/auth for login or signup
router.post('/login', loginOrSignup);

module.exports = router;
