// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');
const verifyTokenOptional = require('../middleware/verifyTokenOptional');
const { upload, processAndSaveImage } = require('../middleware/upload');

router.get('/default-avatars', userController.getDefaultAvatars);

router.get('/:username', verifyTokenOptional, userController.getPublicProfile);

router.put('/profile', verifyToken, userController.updateProfile);

router.put('/profile/password', verifyToken, userController.changePassword);

router.put('/profile/avatar-url', verifyToken, userController.updateAvatarUrl);
router.delete('/profile/avatar', verifyToken, userController.deleteAvatar);

router.post(
    '/profile/avatar',
    verifyToken,
    upload.single('avatar'),
    processAndSaveImage('avatars/custom', 'user', 500),
    userController.uploadAvatar
);

router.delete('/me', verifyToken, userController.deleteAccount);

module.exports = router;