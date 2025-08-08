const express = require('express');
const router = express.Router();
const { addProductReview } = require('../controllers/reviewController')

//POST /review
router.post('/', addProductReview)

module.exports = router;