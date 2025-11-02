// backend/middleware/upload.js
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { ensureDirExists } = require('../utils/fileUtils');

// Налаштування для завантаження у тимчасову папку
const tempUploadPath = path.join(__dirname, '..', 'uploads', 'temp');
const mediaUploadPath = path.join(__dirname, '..', 'uploads', 'media');

// Переконуємося, що папки існують при старті
ensureDirExists(tempUploadPath);
ensureDirExists(mediaUploadPath);

// Фільтр файлів для медіатеки
const mediaFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Помилка: Дозволені лише файли зображень (jpeg, png, webp)!'));
};

// Multer для медіатеки (зберігає у /uploads/temp)
const tempStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempUploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `temp-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const mediaUpload = multer({
    storage: tempStorage,
    fileFilter: mediaFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB
});

// Існуючі middleware для обробки зображень
const memoryStorage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Помилка: Дозволені лише файли зображень (jpeg, png, gif, webp)!'));
};
const upload = multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB
});

// Middleware для обробки та збереження зображень (аватарів, зображень товарів)
const processAndSaveImage = (subfolder, filenamePrefix, size = 128) => {
    return async (req, res, next) => {
        if (!req.file) { return next(); }
        try {
            const uploadPath = path.join(__dirname, '..', 'uploads', subfolder);
            await ensureDirExists(uploadPath);
            const userId = req.user ? req.user.id : 'new-user';
            const finalPrefix = filenamePrefix === 'user' ? `user-${userId}` : filenamePrefix;
            const filename = `${finalPrefix}-${Date.now()}.webp`;
            const fullPath = path.join(uploadPath, filename);

            await sharp(req.file.buffer)
                .resize(size, size, { fit: sharp.fit.cover, position: sharp.strategy.entropy })
                .toFormat('webp')
                .webp({ quality: 80 })
                .toFile(fullPath);
            
            req.file.path = `/uploads/${subfolder}/${filename}`;
            req.file.filename = filename;
            next();
        } catch (error) {
            console.error('Помилка обробки зображення:', error);
            res.status(500).json({ message: 'Не вдалося обробити зображення.' });
        }
    };
};

// Middleware для обробки та збереження логотипів сайтів
const processAndSaveLogo = (size = 64) => {
    return async (req, res, next) => {
        if (!req.file) {
            return next();
        }

        try {
            // Всі завантажені користувачами логотипи зберігаються в підпапці 'custom'
            const uploadPath = path.join(__dirname, '..', 'uploads', 'shops', 'logos', 'custom');
            await ensureDirExists(uploadPath);

            const filename = `logo-${req.user.id}-${Date.now()}.webp`;
            const fullPath = path.join(uploadPath, filename);

            await sharp(req.file.buffer)
                .resize(size, size, {
                    fit: sharp.fit.inside,
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .toFormat('webp')
                .webp({ quality: 85 })
                .toFile(fullPath);
            
            // Шлях, що зберігається в базі даних, також включає 'custom'
            req.file.path = `/uploads/shops/logos/custom/${filename}`;
            req.file.filename = filename;

            next();
        } catch (error) {
            console.error('Помилка обробки логотипу:', error);
            res.status(500).json({ message: 'Не вдалося обробити логотип.' });
        }
    };
};

/**
 * Обробляє та зберігає загальне зображення, обмежуючи ширину та зберігаючи пропорції.
 * @param {number} maxWidth - Максимальна ширина зображення
 */
const processAndSaveGeneric = (subfolder, filenamePrefix, maxWidth = 1200) => {
    return async (req, res, next) => {
        if (!req.file) { return next(); }
        try {
            const uploadPath = path.join(__dirname, '..', 'uploads', subfolder);
            await ensureDirExists(uploadPath);
            
            const userId = req.user ? req.user.id : 'guest';
            const finalPrefix = `${filenamePrefix}-${userId}`;
            const filename = `${finalPrefix}-${Date.now()}.webp`;
            const fullPath = path.join(uploadPath, filename);

            await sharp(req.file.buffer)
                .resize({ 
                    width: maxWidth, 
                    fit: sharp.fit.inside, // Зберігає пропорції
                    withoutEnlargement: true // Не збільшує, якщо зображення менше
                })
                .toFormat('webp')
                .webp({ quality: 80 })
                .toFile(fullPath);
            
            req.file.path = `/uploads/${subfolder}/${filename}`;
            req.file.filename = filename;
            next();
        } catch (error) {
            console.error('Помилка обробки загального зображення:', error);
            res.status(500).json({ message: 'Не вдалося обробити зображення.' });
        }
    };
};

module.exports = {
    upload,
    processAndSaveImage,
    processAndSaveLogo,
    processAndSaveGeneric,
    mediaUpload
};