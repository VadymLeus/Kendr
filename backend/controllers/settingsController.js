// backend/controllers/settingsController.js
const User = require('../models/User');

exports.updatePlatformTheme = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { platform_theme_mode, platform_theme_accent } = req.body;

        // Валідація (можна додати перевірку на допустимі значення)
        if (!platform_theme_mode || !platform_theme_accent) {
            return res.status(400).json({ message: 'Необхідно вказати режим та акцентний колір.' });
        }

        const updatedUser = await User.update(userId, { platform_theme_mode, platform_theme_accent });
        
        // Повертаємо тільки необхідні для оновлення дані
        res.json({
            platform_theme_mode: updatedUser.platform_theme_mode,
            platform_theme_accent: updatedUser.platform_theme_accent
        });

    } catch (error) {
        next(error);
    }
};