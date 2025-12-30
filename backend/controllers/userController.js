// backend/controllers/userController.js
const User = require('../models/User');
const Warning = require('../models/Warning');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { deleteFile } = require('../utils/fileUtils');
const db = require('../config/db');

const sanitizeUser = (user) => {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
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
        has_password: !!user.password_hash
    };
};

exports.getPublicProfile = async (req, res, next) => {
    try {
        const user = await User.findByUsername(req.params.username);
        
        if (!user) {
            return res.status(404).json({ 
                message: 'Користувача не знайдено',
                code: 'USER_NOT_FOUND' 
            });
        }

        if (!user.is_profile_public) {
            const isOwner = req.user && req.user.id === user.id;
            const isAdmin = req.user && req.user.role === 'admin';

            if (!isOwner && !isAdmin) {
                return res.status(403).json({ 
                    message: 'Цей профіль є приватним.',
                    code: 'PROFILE_PRIVATE' 
                });
            }
        }
        
        const siteCount = await User.getSiteCount(user.id);
        
        let warnings = [];
        if (req.user && (req.user.id === user.id || req.user.role === 'admin')) {
             warnings = await Warning.findForUser(user.id);
        }

        const publicData = {
            id: user.id,
            username: user.username,
            createdAt: user.created_at,
            siteCount: siteCount,
            avatar_url: user.avatar_url,
            bio: user.bio,
            is_profile_public: user.is_profile_public,
            socials: {
                telegram: user.social_telegram,
                instagram: user.social_instagram,
                website: user.social_website
            },
            warnings: warnings 
        };
        
        res.json(publicData);
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const allowedFields = [
            'username', 'email', 'phone_number', 
            'platform_theme_mode', 'platform_theme_accent', 
            'platform_bg_url', 'platform_bg_blur', 'platform_bg_brightness',
            'bio', 'social_telegram', 'social_instagram', 'social_website', 
            'is_profile_public'
        ];

        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        if (updates.username) {
            const [rows] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [updates.username, userId]);
            if (rows.length > 0) {
                return res.status(400).json({ message: 'Це ім\'я користувача вже зайнято.' });
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'Немає даних для оновлення' });
        }

        const updatedUserRaw = await User.update(userId, updates);
        
        const hasPwd = await User.hasPassword(userId);

        res.json({ 
            message: 'Профіль успішно оновлено!', 
            user: sanitizeUser({ ...updatedUserRaw, has_password: hasPwd })
        });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        const user = userRows[0];

        if (user.password_hash) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Введіть поточний пароль.' });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Невірний поточний пароль.' });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.update(userId, { password_hash: hashedPassword });

        const updatedUserRaw = await User.findById(userId);

        res.json({ 
            message: user.password_hash ? 'Пароль успішно змінено.' : 'Пароль успішно встановлено.',
            user: sanitizeUser({ ...updatedUserRaw, has_password: true }) 
        });

    } catch (error) {
        next(error);
    }
};

exports.deleteAccount = async (req, res, next) => {
    try {
        const { confirmation } = req.body;
        if (confirmation !== 'DELETE') {
            return res.status(400).json({ message: 'Невірне підтвердження.' });
        }

        const userId = req.user.id;
        const user = await User.findById(userId);
        
        if (user.avatar_url && user.avatar_url.includes('/avatars/custom/')) {
            await deleteFile(user.avatar_url);
        }

        await User.deleteById(userId);

        res.json({ message: 'Акаунт успішно видалено.' });
    } catch (error) {
        next(error);
    }
};

exports.updateAvatarUrl = async (req, res, next) => {
    const { avatar_url } = req.body;
    const userId = req.user.id;

    try {
        const currentUser = await User.findById(userId);
        const oldAvatarUrl = currentUser.avatar_url;
        
        if (oldAvatarUrl && oldAvatarUrl.includes('/avatars/custom/') && oldAvatarUrl !== avatar_url) {
            await deleteFile(oldAvatarUrl);
        }

        const updatedUserRaw = await User.update(userId, { avatar_url });
        const hasPwd = await User.hasPassword(userId);
        
        res.json({ 
            message: 'Аватар оновлено!', 
            user: sanitizeUser({ ...updatedUserRaw, has_password: hasPwd }) 
        });
    } catch (error) {
        next(error);
    }
};

exports.getDefaultAvatars = (req, res, next) => {
    const defaultAvatarsDir = path.join(__dirname, '..', 'uploads', 'avatars', 'default');
    
    if (!fs.existsSync(defaultAvatarsDir)) {
         return res.json([]); 
    }
    
    const files = fs.readdirSync(defaultAvatarsDir);
    const avatarUrls = files.map(file => `/uploads/avatars/default/${file}`);
    res.json(avatarUrls);
};

exports.uploadAvatar = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Файл не завантажено.' });
    }
    
    const userId = req.user.id;
    
    const newAvatarUrl = `/uploads/avatars/custom/${req.file.filename}`;

    try {
        const currentUser = await User.findById(userId);
        const oldAvatarUrl = currentUser.avatar_url;

        if (oldAvatarUrl && oldAvatarUrl.includes('/avatars/custom/')) {
            await deleteFile(oldAvatarUrl);
        }

        const updatedUserRaw = await User.update(userId, { avatar_url: newAvatarUrl });
        const hasPwd = await User.hasPassword(userId);

        res.json({ 
            message: 'Аватар завантажено!', 
            user: sanitizeUser({ ...updatedUserRaw, has_password: hasPwd }) 
        });
    } catch (error) {
        await deleteFile(req.file.path); 
        next(error);
    }
};

exports.deleteAvatar = async (req, res, next) => {
    try {
        await db.query('UPDATE users SET avatar_url = NULL WHERE id = ?', [req.user.id]);
        
        const user = await User.findById(req.user.id);
        
        res.json({ 
            message: 'Аватар видалено', 
            user: {
                ...user,
                password_hash: undefined,
                verification_token: undefined,
                reset_token: undefined
            }
        });
    } catch (error) {
        next(error);
    }
};