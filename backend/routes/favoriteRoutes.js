// backend/routes/favoriteRoutes.js
const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const verifyToken = require('../middleware/verifyToken');

// Всі маршрути захищені, бо лише авторизовані користувачі можуть мати обране
router.use(verifyToken);

router.get('/', favoriteController.getFavorites);
router.get('/ids', favoriteController.getFavoriteIds);
router.post('/:siteId', favoriteController.addFavorite);
router.delete('/:siteId', favoriteController.removeFavorite);

module.exports = router;