// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const { upload, processAndSaveImage } = require('../middleware/upload');

// Отримати список стандартних аватарів
router.get('/default-avatars', userController.getDefaultAvatars);

// Оновити дані профілю (ім'я, пароль)
router.put('/profile/update', verifyToken, userController.updateProfile);

// Оновити аватар, вибравши один зі стандартних
router.put('/profile/avatar-url', verifyToken, userController.updateAvatarUrl);

// Завантажити новий кастомний аватар
router.post(
    '/profile/avatar',
    verifyToken,
    upload.single('avatar'),
    processAndSaveImage('avatars/custom', 'user', 128),
    userController.uploadAvatar
);

// Отримати публічний профіль користувача
router.get('/:username', userController.getPublicProfile);

module.exports = router;