// backend/routes/siteRoutes.js
const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const verifyToken = require('../middleware/verifyToken');
const verifyTokenOptional = require('../middleware/verifyTokenOptional');
const { upload, processAndSaveLogo } = require('../middleware/upload');

// Отримати каталоги сайтів (авторизація не обов'язкова)
router.get('/catalog', verifyTokenOptional, siteController.getSites);

// Отримати список шаблонів
router.get('/templates', siteController.getTemplates);

// Отримати список стандартних логотипів
router.get('/default-logos', siteController.getDefaultLogos);

// Отримати дані конкретного сайту за його шляхом
router.get('/:site_path', siteController.getSiteByPath);

// Створити новий сайт (з обробкою завантаженого логотипа)
router.post(
    '/create',
    verifyToken,
    upload.single('logo'), // Очікує файл у полі 'logo'
    processAndSaveLogo(64), // Обробляє його, стискаючи до 64px
    siteController.createSite
);

// Оновити контент сайту (текстові блоки)
router.put('/:site_path/update', verifyToken, siteController.updateSiteContent);

// Оновити основні налаштування сайту (назву, статус, теги)
router.put('/:site_path/settings', verifyToken, siteController.updateSiteSettings);

// Видалити сайт
router.delete('/:site_path', verifyToken, siteController.deleteSite);

module.exports = router;