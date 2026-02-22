// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middleware/verifyToken');

router.post('/checkout', orderController.processCheckout);
router.post('/liqpay-callback', orderController.liqpayCallback);
router.get('/site/:siteId', verifyToken, orderController.getSiteOrders);
router.put('/:id/status', verifyToken, orderController.updateOrderStatus);

module.exports = router;