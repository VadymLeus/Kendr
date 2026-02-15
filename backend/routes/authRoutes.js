// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { upload, processAndSaveImage } = require('../middleware/upload');
const passport = require('passport');
const verifyToken = require('../middleware/verifyToken');
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

router.post(
    '/register',
    upload.single('avatar'),
    processAndSaveImage('avatars/custom', 'avatar', 128),
    authController.register
);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));
router.get(
    '/google/callback', 
    passport.authenticate('google', { 
        session: false,
        failureRedirect: `${clientUrl}/login?error=google_auth_failed`
    }),
    authController.googleCallback
);
router.get('/me', verifyToken, authController.getMe);
module.exports = router;