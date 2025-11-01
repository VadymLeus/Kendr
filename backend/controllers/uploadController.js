// backend/controllers/uploadController.js

/**
 * @desc Завантажити одне зображення для загального використання (напр. редактор блоків)
 * @route POST /api/upload
 * @access Private
 */
exports.uploadGenericImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Файл не було завантажено.' });
    }

    // req.file.path надається нашим middleware processAndSaveGeneric
    res.status(201).json({
        message: 'Файл успішно завантажено',
        filePath: req.file.path // Наприклад: /uploads/general/img-123456789.webp
    });
};