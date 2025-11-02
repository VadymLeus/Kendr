// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middleware/verifyToken');
const { upload, processAndSaveImage } = require('../middleware/upload');

// Отримати всі товари для сайту
router.get('/site/:siteId', productController.getProductsForSite);

// Отримати товар за ID
router.get('/:productId', productController.getProductById);

// Додати новий товар (БЕЗ завантаження файлу, очікує image_url в body)
router.post(
    '/',
    verifyToken,
    productController.addProduct
);

router.put(
    '/:productId',
    verifyToken,
    productController.updateProduct
);

// Видалити товар
router.delete('/:productId', verifyToken, productController.deleteProduct);

// Додати зображення до галереї товару
router.post(
    '/:productId/gallery',
    verifyToken,
    upload.single('galleryImage'),
    processAndSaveImage('shops/products/gallery', 'gallery', 500),
    productController.addToGallery
);

// Видалити зображення з галереї товару
router.delete(
    '/:productId/gallery',
    verifyToken,
    productController.removeFromGallery
);

module.exports = router;