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
        const mimeType = req.file.mimetype;
        
        const isVideo = mimeType.startsWith('video/');
        const baseFileName = `user-${userId}-${Date.now()}`;
        
        let fullFileName, thumbFileName, fullDiskPath, thumbDiskPath, path_full, path_thumb;
        let file_size_kb = 0;

        if (isVideo) {
            fullFileName = `${baseFileName}${path.extname(originalName)}`;
            fullDiskPath = path.join(__dirname, '..', 'uploads', 'media', fullFileName);
            
            await fs.rename(tempPath, fullDiskPath);
            
            path_full = `/uploads/media/${fullFileName}`;
            path_thumb = null;

            const stats = await fs.stat(fullDiskPath);
            file_size_kb = Math.round(stats.size / 1024);

        } else {
            fullFileName = `${baseFileName}-full.webp`;
            thumbFileName = `${baseFileName}-thumb.webp`;

            fullDiskPath = path.join(__dirname, '..', 'uploads', 'media', fullFileName);
            thumbDiskPath = path.join(__dirname, '..', 'uploads', 'media', thumbFileName);

            path_full = `/uploads/media/${fullFileName}`;
            path_thumb = `/uploads/media/${thumbFileName}`;

            await sharp(tempPath)
                .resize({ width: 1920, fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(fullDiskPath);

            await sharp(tempPath)
                .resize({ width: 300, fit: 'cover' })
                .webp({ quality: 75 })
                .toFile(thumbDiskPath);

            const stats = await fs.stat(fullDiskPath);
            file_size_kb = Math.round(stats.size / 1024);
            
            await fs.unlink(tempPath); 
        }

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
        try { 
            await fs.access(tempPath);
            await fs.unlink(tempPath); 
        } catch (e) {}
        
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
        if (media.path_thumb) {
            await deleteFile(media.path_thumb);
        }
        
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