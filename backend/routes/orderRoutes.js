// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middleware/verifyToken');

router.post('/checkout', verifyToken, orderController.processCheckout);

module.exports = router;