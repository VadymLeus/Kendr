// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

exports.register = async (req, res, next) => {
    const { username, email, password, avatar_url: selected_avatar_url } = req.body;

    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
        return res.status(400).json({ message: 'Користувач з таким email вже існує.' });
    }
    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
        return res.status(400).json({ message: 'Це ім\'я користувача вже зайняте.' });
    }

    let avatar_url;

    if (req.file) {
        avatar_url = `/uploads/avatars/custom/${req.file.filename}`;
    } else if (selected_avatar_url) {
        avatar_url = selected_avatar_url;
    } else {
        const defaultAvatarsDir = path.join(__dirname, '..', 'uploads', 'avatars', 'default');
        const defaultAvatars = fs.readdirSync(defaultAvatarsDir);
        if (defaultAvatars.length > 0) {
            const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
            avatar_url = `/uploads/avatars/default/${randomAvatar}`;
        } else {
            // Резервний варіант, якщо папка з аватарами порожня
            avatar_url = '/uploads/avatars/default/avatar1.png';
        }
    }

    const user = await User.create({ username, email, password, avatar_url });
    res.status(201).json({ message: 'Користувача успішно зареєстровано!', user });
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(401).json({ message: 'Невірний email або пароль.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Невірний email або пароль.' });
        }

        // Оновлюємо час останнього входу
        await User.updateLastLogin(user.id);

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.json({
            token,
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email, 
                avatar_url: user.avatar_url,
                role: user.role,
                platform_theme_mode: user.platform_theme_mode,
                platform_theme_accent: user.platform_theme_accent
            }
        });
    } catch (error) {
        next(error);
    }
};