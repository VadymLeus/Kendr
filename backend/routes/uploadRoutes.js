// backend/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const verifyToken = require('../middleware/verifyToken');
const { upload, processAndSaveGeneric } = require('../middleware/upload');

router.post(
    '/', 
    verifyToken, 
    upload.single('image'), 
    processAndSaveGeneric('media', 'user-img', 1200), 
    uploadController.uploadGenericImage
);

module.exports = router;