// backend/controllers/tagController.js
const Tag = require('../models/Tag');

// Отримати список всіх доступних тегів
exports.getAllTags = async (req, res, next) => {
    try {
        const tags = await Tag.getAll();
        res.json(tags);
    } catch (error) {
        next(error);
    }
};

// Отримати теги для конкретного сайту
exports.getTagsForSite = async (req, res, next) => {
    try {
        const { siteId } = req.params;
        const tags = await Tag.findBySiteId(siteId);
        res.json(tags);
    } catch (error) {
        next(error);
    }
};