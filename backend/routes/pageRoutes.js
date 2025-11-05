// backend/routes/pageRoutes.js
const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const verifyToken = require('../middleware/verifyToken');

// Всі маршрути захищені
router.use(verifyToken);

router.get('/:pageId', pageController.getPageById);
router.put('/:pageId/content', pageController.updatePageContent);
router.put('/:pageId/settings', pageController.updatePageSettings);
router.delete('/:pageId', pageController.deletePage);
router.post('/:pageId/set-home', pageController.setHomePage);

module.exports = router;