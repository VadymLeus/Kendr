// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middleware/verifyToken');
const { upload, processAndSaveImage } = require('../middleware/upload');

// Отримати товар за ID
router.get('/:productId', productController.getProductById);

// Додати новий товар (з обробкою зображення)
router.post(
    '/',
    verifyToken,
    upload.single('productImage'),
    // Зображення зберігаються в папку 'shops/products', стискаються до 500px
    processAndSaveImage('shops/products', 'product', 500),
    productController.addProduct
);

// Оновити товар (з обробкою нового зображення)
router.put(
    '/:productId',
    verifyToken,
    upload.single('productImage'),
    // Зображення зберігаються в папку 'shops/products', стискаються до 500px
    processAndSaveImage('shops/products', 'product', 500),
    productController.updateProduct
);

// Видалити товар
router.delete('/:productId', verifyToken, productController.deleteProduct);

module.exports = router;