// backend/controllers/uploadController.js
const Media = require('../models/Media');

/**
 * @desc Завантажити одне зображення для загального використання
 */
exports.uploadGenericImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не було завантажено.' });
        }

        await Media.create(req.user.id, req.file.path, req.file.originalname);

        res.status(201).json({
            message: 'Файл успішно завантажено',
            filePath: req.file.path
        });
    } catch (error) {
        next(error);
    }
};