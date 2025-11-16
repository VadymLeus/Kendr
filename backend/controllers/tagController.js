// backend/controllers/tagController.js
const Tag = require('../models/Tag');

exports.getAllTags = async (req, res, next) => {
    try {
        const tags = await Tag.getAll();
        res.json(tags);
    } catch (error) {
        next(error);
    }
};

exports.getTagsForSite = async (req, res, next) => {
    try {
        const { siteId } = req.params;
        const tags = await Tag.findBySiteId(siteId);
        res.json(tags);
    } catch (error) {
        next(error);
    }
};