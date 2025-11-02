// backend/routes/mediaRoutes.js
const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const verifyToken = require('../middleware/verifyToken');
const { mediaUpload } = require('../middleware/upload');

// Всі маршрути медіа-бібліотеки захищені
router.use(verifyToken);

// Отримати всі медіафайли користувача
router.get('/', mediaController.getAll);

// Завантажити новий файл
router.post(
    '/upload', 
    mediaUpload.single('mediaFile'),
    mediaController.upload
);

// Оновити alt_text
router.put('/:id', mediaController.updateMedia);

// Видалити медіафайл
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;