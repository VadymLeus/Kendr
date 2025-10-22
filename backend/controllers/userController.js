// backend/controllers/userController.js
const User = require('../models/User');
const Warning = require('../models/Warning');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { deleteFile } = require('../utils/fileUtils');

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
    const { username, newPassword, currentPassword } = req.body;
    const userId = req.user.id;

    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ message: 'Користувача не знайдено.' });

    if (!currentPassword) {
        return res.status(400).json({ message: 'Для внесення змін потрібен поточний пароль.' });
    }
    
    const userForAuth = await User.findByEmail(currentUser.email);
    const isMatch = await bcrypt.compare(currentPassword, userForAuth.password_hash);
    if (!isMatch) {
        return res.status(401).json({ message: 'Невірний поточний пароль.' });
    }
    
    if (username && username !== currentUser.username) {
        const existingUser = await User.findByUsername(username);
        if (existingUser && existingUser.id !== userId) {
            return res.status(400).json({ message: 'Це ім\'я користувача вже зайнято.' });
        }
    }

    const updatedUser = await User.update(userId, { username, password: newPassword });
    res.json({ message: 'Профіль успішно оновлено!', user: updatedUser });
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