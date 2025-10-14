// backend/routes/tagRoutes.js
const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// Маршрут для отримання всіх тегів
router.get('/', tagController.getAllTags);

// Маршрут для отримання тегів конкретного сайту
router.get('/site/:siteId', tagController.getTagsForSite);

module.exports = router;