// backend/controllers/authController.js
const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const db = require('../config/db');

exports.register = async (req, res, next) => {
    try {
        const { username, email, password, avatar_url: selected_avatar_url } = req.body;

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Пароль занадто слабкий.' });
        }

        const existingUserByEmail = await User.findByEmail(email);
        if (existingUserByEmail) {
            return res.status(400).json({ message: 'Користувач з таким email вже існує.' });
        }
        
        const existingUserByUsername = await User.findByUsername(username);
        if (existingUserByUsername) {
            return res.status(400).json({ message: "Це ім'я користувача вже зайняте." });
        }

        let avatar_url = null;

        if (req.file) {
            avatar_url = `/uploads/avatars/custom/${req.file.filename}`;
        } else if (selected_avatar_url) {
            avatar_url = selected_avatar_url;
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        await User.create({ 
            username, 
            email, 
            password, 
            avatar_url,
            is_verified: 0, 
            verification_token: verificationToken 
        });

        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (mailError) {
            console.error("Failed to send email:", mailError);
        }

        res.status(201).json({ 
            message: 'Акаунт створено! На вашу пошту надіслано лист для підтвердження.' 
        });

    } catch (error) {
        next(error);
    }
};

exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Токен відсутній' });

        const user = await User.findByVerificationToken(token);
        
        if (!user) {
            return res.status(400).json({ message: 'Недійсний або застарілий токен' });
        }

        await User.verifyUser(user.id);

        res.json({ message: 'Email успішно підтверджено! Тепер ви можете увійти.' });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { loginInput, password } = req.body;
        const user = await User.findByLoginInput(loginInput);

        if (!user) return res.status(401).json({ message: 'Невірний логін або пароль.' });

        if (user.is_verified === 0) {
            return res.status(403).json({ 
                message: 'Ваша пошта не підтверджена.',
                isNotVerified: true,
                email: user.email
            });
        }

        if (!user.password_hash) {
             return res.status(400).json({ 
                 message: 'У цього акаунта ще не встановлено пароль. Увійдіть через Google або скористайтеся відновленням пароля.' 
             });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
             return res.status(401).json({ message: 'Невірний логін або пароль.' });
        }

        await User.updateLastLogin(user.id);
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        const hasPassword = !!user.password_hash;

        res.json({
            token,
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email, 
                avatar_url: user.avatar_url,
                role: user.role,
                platform_theme_mode: user.platform_theme_mode,
                platform_theme_accent: user.platform_theme_accent,
                has_password: hasPassword
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findByEmail(email);

        if (!user) return res.status(404).json({ message: 'Користувача не знайдено.' });
        if (user.is_verified) return res.status(400).json({ message: 'Акаунт вже підтверджено.' });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        await db.query('UPDATE users SET verification_token = ? WHERE id = ?', [verificationToken, user.id]);

        await sendVerificationEmail(email, verificationToken);

        res.json({ message: 'Лист успішно відправлено повторно!' });
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findByEmail(email);

        if (!user) {
            return res.json({ message: 'Якщо цей email існує, ми надіслали інструкції.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000);

        await db.query(
            'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
            [resetToken, expires, user.id]
        );

        await sendPasswordResetEmail(email, resetToken);

        res.json({ message: 'Інструкції надіслано на вашу пошту.' });
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        
        const [users] = await db.query(
            'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Токен недійсний або його термін дії закінчився.' });
        }

        const user = users[0];
        
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ message: 'Пароль занадто слабкий (мін. 8 символів, цифра, велика літера).' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await db.query(
            'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
            [passwordHash, user.id]
        );

        res.json({ message: 'Пароль успішно змінено! Тепер ви можете увійти.' });
    } catch (error) {
        next(error);
    }
};

exports.googleCallback = async (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.redirect(`http://localhost:5173/auth/success?token=${token}`);
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

        const hasPassword = await User.hasPassword(req.user.id);

        res.json({
            id: user.id, 
            username: user.username, 
            email: user.email, 
            avatar_url: user.avatar_url,
            role: user.role,
            platform_theme_mode: user.platform_theme_mode,
            platform_theme_accent: user.platform_theme_accent,
            platform_bg_url: user.platform_bg_url,
            platform_bg_blur: user.platform_bg_blur,
            platform_bg_brightness: user.platform_bg_brightness,
            bio: user.bio,
            social_telegram: user.social_telegram,
            social_instagram: user.social_instagram,
            social_website: user.social_website,
            is_profile_public: user.is_profile_public,
            phone_number: user.phone_number,
            has_password: hasPassword
        });
    } catch (error) {
        next(error);
    }
};