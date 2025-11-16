// backend/routes/settingsRoutes.js
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const verifyToken = require('../middleware/verifyToken');

router.put('/platform-theme', verifyToken, settingsController.updatePlatformTheme);

module.exports = router;