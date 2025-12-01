// backend/controllers/MediaController.js
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
        const isFont = mimeType.includes('font') || /\.(ttf|otf|woff|woff2)$/i.test(originalName);
        
        const baseFileName = `user-${userId}-${Date.now()}`;
        
        let fullFileName, fullDiskPath, path_full, path_thumb;
        let file_size_kb = 0;
        let fileType = 'image';

        if (isVideo || isFont) {
            const originalExt = path.extname(originalName).toLowerCase();
            fullFileName = `${baseFileName}${originalExt}`;
            fullDiskPath = path.join(__dirname, '..', 'uploads', 'media', fullFileName);
            
            await fs.rename(tempPath, fullDiskPath);
            
            path_full = `/uploads/media/${fullFileName}`;
            path_thumb = null;
            fileType = isVideo ? 'video' : 'font';

            const stats = await fs.stat(fullDiskPath);
            file_size_kb = Math.round(stats.size / 1024);

            console.log(`Успішно завантажено ${fileType}:`, {
                originalName,
                savedAs: fullFileName,
                size: file_size_kb + 'KB'
            });

        } else {
            fullFileName = `${baseFileName}-full.webp`;
            const thumbFileName = `${baseFileName}-thumb.webp`;

            fullDiskPath = path.join(__dirname, '..', 'uploads', 'media', fullFileName);
            const thumbDiskPath = path.join(__dirname, '..', 'uploads', 'media', thumbFileName);

            path_full = `/uploads/media/${fullFileName}`;
            path_thumb = `/uploads/media/${thumbFileName}`;

            await sharp(tempPath)
                .resize({ width: 1920, fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(fullDiskPath);

            await sharp(tempPath)
                .resize({ width: 300, height: 200, fit: 'cover' })
                .webp({ quality: 75 })
                .toFile(thumbDiskPath);

            const stats = await fs.stat(fullDiskPath);
            file_size_kb = Math.round(stats.size / 1024);
            
            await fs.unlink(tempPath);

            console.log('Успішно завантажено та оброблено зображення:', {
                originalName,
                savedAs: fullFileName,
                size: file_size_kb + 'KB'
            });
        }

        const mediaData = {
            userId,
            path_full,
            path_thumb,
            original_file_name: originalName,
            mime_type: mimeType,
            file_size_kb,
            file_type: fileType
        };
        
        const newMedia = await Media.create(mediaData);
        
        res.status(201).json({
            ...newMedia,
            message: `Файл "${originalName}" успішно завантажено`
        });

    } catch (error) {
        try { 
            await fs.access(tempPath);
            await fs.unlink(tempPath); 
        } catch (e) {
            console.log('Тимчасовий файл вже видалений або недоступний');
        }
        
        console.error('Помилка завантаження файлу:', error);
        next(error);
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const { type } = req.query; 
        let mediaFiles;
        
        if (type && ['image', 'video', 'font'].includes(type)) {
            mediaFiles = await Media.findByType(req.user.id, type);
        } else {
            mediaFiles = await Media.findByUserId(req.user.id);
        }
        
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

        res.json({ 
            message: 'Файл успішно видалено.',
            deletedFile: media.original_file_name
        });
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
        
        res.json({ 
            message: 'Alt-текст успішно оновлено.',
            updatedFile: {
                id: media.id,
                original_name: media.original_file_name,
                alt_text: alt_text
            }
        });

    } catch (error) {
        next(error);
    }
};

exports.getFonts = async (req, res, next) => {
    try {
        const fonts = await Media.findByType(req.user.id, 'font');
        res.json(fonts);
    } catch (error) {
        next(error);
    }
};