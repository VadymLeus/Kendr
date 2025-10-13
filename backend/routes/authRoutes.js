// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { upload, processAndSaveImage } = require('../middleware/upload');

// Маршрут реєстрації: спочатку завантаження файлу, потім обробка зображення, потім контролер
router.post(
    '/register',
    upload.single('avatar'),
    processAndSaveImage('avatars/custom', 'avatar', 128),
    authController.register
);

router.post('/login', authController.login);

module.exports = router;