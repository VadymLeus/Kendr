// backend/controllers/favoriteController.js
const Favorite = require('../models/Favorite');

exports.getFavorites = async (req, res, next) => {
    try {
        const favorites = await Favorite.findForUser(req.user.id);
        res.json(favorites);
    } catch (error) {
        next(error);
    }
};

exports.getFavoriteIds = async (req, res, next) => {
    try {
        const favoriteIds = await Favorite.findIdsForUser(req.user.id);
        res.json(favoriteIds);
    } catch (error) {
        next(error);
    }
};

exports.addFavorite = async (req, res, next) => {
    try {
        const { siteId } = req.params;
        await Favorite.add(req.user.id, siteId);
        res.status(201).json({ message: 'Сайт додано до обраних.' });
    } catch (error) {
        next(error);
    }
};

exports.removeFavorite = async (req, res, next) => {
    try {
        const { siteId } = req.params;
        await Favorite.remove(req.user.id, siteId);
        res.json({ message: 'Сайт видалено з обраних.' });
    } catch (error) {
        next(error);
    }
};