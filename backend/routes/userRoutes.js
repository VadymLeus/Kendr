// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const { upload, processAndSaveImage } = require('../middleware/upload');

router.get('/default-avatars', userController.getDefaultAvatars);

router.put('/profile/update', verifyToken, userController.updateProfile);

router.put('/profile/avatar-url', verifyToken, userController.updateAvatarUrl);

router.post(
    '/profile/avatar',
    verifyToken,
    upload.single('avatar'),
    processAndSaveImage('avatars/custom', 'user', 128),
    userController.uploadAvatar
);

router.get('/:username', userController.getPublicProfile);

module.exports = router;