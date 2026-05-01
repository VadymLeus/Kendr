// backend/routes/deliveryRoutes.js
const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

router.get('/cities', deliveryController.getCities);
router.get('/warehouses', deliveryController.getWarehouses);

module.exports = router;