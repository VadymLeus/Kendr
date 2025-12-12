// backend/controllers/userController.js
const User = require('../models/User');
const Warning = require('../models/Warning');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { deleteFile } = require('../utils/fileUtils');
const db = require('../config/db');

exports.getPublicProfile = async (req, res, next) => {
    const user = await User.findByUsername(req.params.username);
    if (!user) {
        return res.status(404).json({ message: 'Користувача не знайдено.' });
    }
    
    const siteCount = await User.getSiteCount(user.id);
    const warnings = await Warning.findForUser(user.id);

    const publicData = {
        username: user.username,
        createdAt: user.created_at,
        siteCount: siteCount,
        avatar_url: user.avatar_url,
        warnings: warnings
    };
    res.json(publicData);
};

exports.updateProfile = async (req, res, next) => {
    const { username, newPassword, currentPassword, platform_theme_mode, platform_theme_accent } = req.body;
    const userId = req.user.id;

    const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const currentUser = userRows[0];
    if (!currentUser) return res.status(404).json({ message: 'Користувача не знайдено.' });

    const requiresPasswordCheck = (username && username !== currentUser.username) || newPassword;
    
    if (requiresPasswordCheck && currentUser.password_hash) {
        if (!currentPassword) {
            return res.status(400).json({ message: 'Для зміни імені або пароля потрібен поточний пароль.' });
        }
        
        const isMatch = await bcrypt.compare(currentPassword, currentUser.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Невірний поточний пароль.' });
        }
    }

    if (username && username !== currentUser.username) {
        const existingUser = await User.findByUsername(username);
        if (existingUser && existingUser.id !== userId) {
            return res.status(400).json({ message: 'Це ім\'я користувача вже зайнято.' });
        }
    }

    let passwordHashToSave = undefined;
    if (newPassword) {
        const salt = await bcrypt.genSalt(10);
        passwordHashToSave = await bcrypt.hash(newPassword, salt);
    }

    let queryParts = [];
    const params = [];

    if (username) {
        queryParts.push('username = ?');
        params.push(username);
    }
    if (passwordHashToSave) {
        queryParts.push('password_hash = ?');
        params.push(passwordHashToSave);
    }
    if (platform_theme_mode) {
        queryParts.push('platform_theme_mode = ?');
        params.push(platform_theme_mode);
    }
    if (platform_theme_accent) {
        queryParts.push('platform_theme_accent = ?');
        params.push(platform_theme_accent);
    }

    if (queryParts.length === 0) {
        const updatedUser = await User.findById(userId);
        return res.json({ message: 'Профіль успішно оновлено!', user: updatedUser });
    }

    let query = `UPDATE users SET ${queryParts.join(', ')} WHERE id = ?`;
    params.push(userId);
    
    await db.query(query, params);
    const updatedUser = await User.findById(userId);
    
    const hasPassword = passwordHashToSave ? true : !!currentUser.password_hash;
    
    res.json({ 
        message: 'Профіль успішно оновлено!', 
        user: {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            avatar_url: updatedUser.avatar_url,
            role: updatedUser.role,
            platform_theme_mode: updatedUser.platform_theme_mode,
            platform_theme_accent: updatedUser.platform_theme_accent,
            has_password: hasPassword
        }
    });
};

exports.updateAvatarUrl = async (req, res, next) => {
    const { avatar_url } = req.body;
    const userId = req.user.id;

    if (!avatar_url || !avatar_url.startsWith('/uploads/avatars/default/')) {
        return res.status(400).json({ message: 'Неприпустима URL-адреса аватара.' });
    }

    try {
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'Користувача не знайдено.' });
        }

        const oldAvatarUrl = currentUser.avatar_url;
        if (oldAvatarUrl && oldAvatarUrl.includes('/avatars/custom/')) {
            await deleteFile(oldAvatarUrl);
        }

        const updatedUser = await User.update(userId, { avatar_url });
        res.json({ message: 'Аватар успішно оновлено!', user: updatedUser });
    } catch (error) {
        next(error);
    }
};

exports.getDefaultAvatars = (req, res, next) => {
    const defaultAvatarsDir = path.join(__dirname, '..', 'uploads', 'avatars', 'default');
    const files = fs.readdirSync(defaultAvatarsDir);
    const avatarUrls = files.map(file => `/uploads/avatars/default/${file}`);
    res.json(avatarUrls);
};

exports.uploadAvatar = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Файл не було завантажено.' });
    }
    
    const userId = req.user.id;
    const newAvatarUrl = req.file.path;
    try {
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            await deleteFile(newAvatarUrl);
            return res.status(404).json({ message: 'Користувача не знайдено.' });
        }
        
        const oldAvatarUrl = currentUser.avatar_url;
        const updatedUser = await User.update(userId, { avatar_url: newAvatarUrl });

        if (oldAvatarUrl && oldAvatarUrl.includes('/avatars/custom/')) {
            await deleteFile(oldAvatarUrl);
        }

        res.json({ message: 'Аватар успішно оновлено!', user: updatedUser });
    } catch (error) {
        await deleteFile(newAvatarUrl);
        next(error);
    }
};