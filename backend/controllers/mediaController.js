// backend/controllers/mediaController.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const Media = require('../models/Media');
const { deleteFile } = require('../utils/fileUtils');

exports.upload = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Файл не було завантажено.' });
    }

    const tempPath = req.file.path;

    try {
        const userId = req.user.id;
        const originalName = req.file.originalname;
        const mimeType = 'image/webp';
        
        const baseFileName = `user-${userId}-${Date.now()}`;
        const fullFileName = `${baseFileName}-full.webp`;
        const thumbFileName = `${baseFileName}-thumb.webp`;

        const fullDiskPath = path.join(__dirname, '..', 'uploads', 'media', fullFileName);
        const thumbDiskPath = path.join(__dirname, '..', 'uploads', 'media', thumbFileName);

        const path_full = `/uploads/media/${fullFileName}`;
        const path_thumb = `/uploads/media/${thumbFileName}`;

        await sharp(tempPath)
            .resize({ width: 1920, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(fullDiskPath);

        await sharp(tempPath)
            .resize({ width: 300, fit: 'cover' })
            .webp({ quality: 75 })
            .toFile(thumbDiskPath);

        const stats = await fs.stat(fullDiskPath);
        const file_size_kb = Math.round(stats.size / 1024);

        await fs.unlink(tempPath);

        const mediaData = {
            userId,
            path_full,
            path_thumb,
            original_file_name: originalName,
            mime_type: mimeType,
            file_size_kb
        };
        
        const newMedia = await Media.create(mediaData);

        res.status(201).json(newMedia);

    } catch (error) {
        if (tempPath) {
            try { await fs.unlink(tempPath); } catch (e) { console.error("Не вдалося видалити temp файл:", e); }
        }
        next(error);
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const mediaFiles = await Media.findByUserId(req.user.id);
        res.json(mediaFiles);
    } catch (error) {
        next(error);
    }
};

exports.deleteMedia = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const media = await Media.findById(id);
        if (!media) {
            return res.status(404).json({ message: 'Файл не знайдено.' });
        }

        if (media.user_id !== userId) {
            return res.status(403).json({ message: 'У вас немає прав на видалення цього файлу.' });
        }

        await deleteFile(media.path_full);
        await deleteFile(media.path_thumb);
        
        await Media.delete(id);

        res.json({ message: 'Файл успішно видалено.' });
    } catch (error) {
        next(error);
    }
};

exports.updateMedia = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { alt_text } = req.body;
        const userId = req.user.id;

        const media = await Media.findById(id);
        if (!media) {
            return res.status(404).json({ message: 'Файл не знайдено.' });
        }

        if (media.user_id !== userId) {
            return res.status(403).json({ message: 'У вас немає прав на редагування цього файлу.' });
        }

        await Media.updateAlt(id, alt_text);
        
        res.json({ message: 'Alt-текст успішно оновлено.' });

    } catch (error) {
        next(error);
    }
};