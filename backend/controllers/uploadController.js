// backend/controllers/uploadController.js
const Media = require('../models/Media');
const path = require('path');
const fs = require('fs');
const getWebPath = (filePath) => {
    return '/' + filePath.replace(/\\/g, '/');
};

exports.uploadGenericImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не було завантажено.' });
        }
        const isSystem = req.query.isSystem === 'true' || req.body.isSystem === 'true';
        const mediaData = {
            userId: req.user.id,
            path_full: getWebPath(req.file.path), 
            path_thumb: null,
            original_file_name: req.file.originalname,
            mime_type: req.file.mimetype,
            file_size_kb: Math.round(req.file.size / 1024),
            file_type: 'image',
            width: req.file.width || null,
            height: req.file.height || null,
            is_system: isSystem
        };

        const newMedia = await Media.create(mediaData);

        res.status(201).json({
            message: 'Файл успішно завантажено',
            media: newMedia,
            filePath: newMedia.path_full 
        });
    } catch (error) {
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Не вдалося видалити файл після помилки:', err);
            });
        }
        next(error);
    }
};