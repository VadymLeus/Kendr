// backend/controllers/favoriteController.js
const Favorite = require('../models/Favorite');

// Отримати всі обрані сайти користувача
exports.getFavorites = async (req, res, next) => {
    try {
        const favorites = await Favorite.findForUser(req.user.id);
        res.json(favorites);
    } catch (error) {
        next(error);
    }
};

// Отримати ID всіх обраних сайтів
exports.getFavoriteIds = async (req, res, next) => {
    try {
        const favoriteIds = await Favorite.findIdsForUser(req.user.id);
        res.json(favoriteIds);
    } catch (error) {
        next(error);
    }
};

// Додати сайт до обраних
exports.addFavorite = async (req, res, next) => {
    try {
        const { siteId } = req.params;
        await Favorite.add(req.user.id, siteId);
        res.status(201).json({ message: 'Сайт додано до обраних.' });
    } catch (error) {
        next(error);
    }
};

// Видалити сайт з обраних
exports.removeFavorite = async (req, res, next) => {
    try {
        const { siteId } = req.params;
        await Favorite.remove(req.user.id, siteId);
        res.json({ message: 'Сайт видалено з обраних.' });
    } catch (error) {
        next(error);
    }
};