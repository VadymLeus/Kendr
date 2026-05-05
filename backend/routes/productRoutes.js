// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middleware/verifyToken');
const verifyTokenOptional = require('../middleware/verifyTokenOptional');
const { upload, processAndSaveImage } = require('../middleware/upload');

router.get('/', productController.getProducts);
router.get('/site/:siteId', productController.getProductsForSite);
router.get('/:productId', productController.getProductById);
router.get('/:productId/reviews', productController.getProductReviews);
router.get('/:productId/purchase-status', verifyToken, productController.checkPurchaseStatus);
router.post('/:productId/reviews', verifyToken, productController.addProductReview);
router.put('/:productId/reviews/:reviewId/reply', verifyToken, productController.replyToReview);
router.delete('/:productId/reviews/:reviewId', verifyToken, productController.deleteReview);
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

router.delete('/:productId', verifyToken, productController.deleteProduct);
router.post(
    '/:productId/gallery',
    verifyToken,
    upload.single('galleryImage'),
    processAndSaveImage('shops/products/gallery', 'gallery', 500),
    productController.addToGallery
);

router.delete(
    '/:productId/gallery',
    verifyToken,
    productController.removeFromGallery
);

module.exports = router;