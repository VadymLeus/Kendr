// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { upload, processAndSaveImage } = require('../middleware/upload');
const verifyTurnstile = require('../middleware/verifyTurnstile'); 
const passport = require('passport');
const verifyToken = require('../middleware/verifyToken');
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const loginWindowMs = (parseInt(process.env.RATE_LIMIT_LOGIN_MINUTES) || 15) * 60 * 1000;
const loginMax = parseInt(process.env.RATE_LIMIT_LOGIN_MAX) || 5;
const registerWindowMs = (parseInt(process.env.RATE_LIMIT_REGISTER_MINUTES) || 60) * 60 * 1000;
const registerMax = parseInt(process.env.RATE_LIMIT_REGISTER_MAX) || 5;
const forgotWindowMs = (parseInt(process.env.RATE_LIMIT_FORGOT_MINUTES) || 60) * 60 * 1000;
const forgotMax = parseInt(process.env.RATE_LIMIT_FORGOT_MAX) || 3;
const adminLoginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 3,
    message: { message: 'Забагато спроб входу до панелі керування. Ваша IP адреса тимчасово заблокована.' },
    standardHeaders: true, legacyHeaders: false,
});

const loginLimiter = rateLimit({
    windowMs: loginWindowMs, max: loginMax,
    message: { message: `Забагато спроб входу. Спробуйте пізніше через ${loginWindowMs / 60000} хвилин.` },
    standardHeaders: true, legacyHeaders: false,
});

const verify2FALimiter = rateLimit({
    windowMs: loginWindowMs, max: loginMax, 
    message: { message: `Забагато спроб введення коду. Спробуйте пізніше через ${loginWindowMs / 60000} хвилин.` },
    standardHeaders: true, legacyHeaders: false,
});

const registerLimiter = rateLimit({
    windowMs: registerWindowMs, max: registerMax,
    message: { message: 'Забагато спроб реєстрації з вашого IP. Спробуйте пізніше.' },
    standardHeaders: true, legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
    windowMs: forgotWindowMs, max: forgotMax,
    message: { message: 'Забагато запитів на відновлення пароля. Спробуйте пізніше.' },
    standardHeaders: true, legacyHeaders: false,
});

const otpResendLimiter = rateLimit({
    windowMs: loginWindowMs, max: 10,
    message: { message: 'Забагато запитів на відправку коду. Спробуйте пізніше.' },
    standardHeaders: true, legacyHeaders: false,
});

router.post(
    '/register',
    registerLimiter,
    upload.single('avatar'),
    verifyTurnstile,
    processAndSaveImage('avatars/custom', 'avatar', 128),
    authController.register
);
router.post('/login', loginLimiter, verifyTurnstile, authController.login);
router.post('/admin/login', adminLoginLimiter, verifyTurnstile, authController.adminLogin);
router.post('/verify-2fa', verify2FALimiter, authController.verify2FA);
router.post('/verify-email', verify2FALimiter, authController.verifyEmail);
router.post('/resend-otp', otpResendLimiter, authController.resendOtp);
router.post('/forgot-password', forgotPasswordLimiter, verifyTurnstile, authController.forgotPassword);
router.post('/verify-reset-code', verify2FALimiter, authController.verifyResetCode);
router.post('/reset-password', forgotPasswordLimiter, authController.resetPassword);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: `${clientUrl}/login?error=google_auth_failed` }),
    authController.googleCallback
);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;