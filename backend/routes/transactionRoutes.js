// backend/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const verifyToken = require('../middleware/verifyToken');

router.post('/upgrade', verifyToken, transactionController.processUpgrade);
router.post('/liqpay-callback', transactionController.liqpayWebhook);

module.exports = router;