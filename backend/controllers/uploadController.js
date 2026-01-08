// backend/controllers/uploadController.js
const Media = require('../models/Media');
const path = require('path');
const fs = require('fs');

// Допоміжна функція для визначення Web-шляху з системного шляху
const getWebPath = (filePath) => {
    // Перетворюємо 'uploads\media\file.jpg' -> '/uploads/media/file.jpg'
    return '/' + filePath.replace(/\\/g, '/');
};

exports.uploadGenericImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не було завантажено.' });
        }

        // Перевіряємо прапорець isSystem (через query або body)
        // Якщо завантажуємо через ImageCropper -> передаємо ?isSystem=true
        const isSystem = req.query.isSystem === 'true' || req.body.isSystem === 'true';

        // Формуємо об'єкт для моделі
        // req.file заповнюється multer-ом. Якщо ви використовуєте sharp у middleware, 
        // переконайтеся, що він додає width/height/size
        const mediaData = {
            userId: req.user.id,
            path_full: getWebPath(req.file.path), 
            path_thumb: null, // Додати логіку мініатюр якщо є
            original_file_name: req.file.originalname,
            mime_type: req.file.mimetype,
            file_size_kb: Math.round(req.file.size / 1024),
            file_type: 'image',
            width: req.file.width || null,   // Якщо middleware витягує розміри
            height: req.file.height || null, // Якщо middleware витягує розміри
            is_system: isSystem
        };

        const newMedia = await Media.create(mediaData);

        res.status(201).json({
            message: 'Файл успішно завантажено',
            media: newMedia,
            // Для фронтенду важливо отримати шлях одразу
            filePath: newMedia.path_full 
        });
    } catch (error) {
        // Якщо виникла помилка, бажано видалити завантажений файл, щоб не засмічувати диск
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Не вдалося видалити файл після помилки:', err);
            });
        }
        next(error);
    }
};