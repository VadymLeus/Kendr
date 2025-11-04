// backend/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const verifyToken = require('../middleware/verifyToken');

router.get('/site/:siteId', categoryController.getCategoriesForSite);
router.post('/', verifyToken, categoryController.createCategory);
router.put('/:categoryId', verifyToken, categoryController.updateCategory);
router.delete('/:categoryId', verifyToken, categoryController.deleteCategory);

module.exports = router;
