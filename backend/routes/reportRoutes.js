// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const verifyTokenOptional = require('../middleware/verifyTokenOptional');

router.post('/', verifyTokenOptional, reportController.createReport);

module.exports = router;