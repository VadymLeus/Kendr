// backend/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const verifyToken = require('../middleware/verifyToken');

// Отримати всі категорії для конкретного сайту
router.get('/site/:siteId', categoryController.getCategoriesForSite);

// Створити нову категорію (потребує авторизації)
router.post('/', verifyToken, categoryController.createCategory);

// Видалити категорію (потребує авторизації)
router.delete('/:categoryId', verifyToken, categoryController.deleteCategory);

module.exports = router;