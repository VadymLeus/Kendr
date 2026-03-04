// backend/middleware/errorHandler.js
const multer = require('multer');
const errorHandler = (err, req, res, next) => {
    const isValidationError = (err instanceof multer.MulterError) || 
                              (err.message && err.message.includes('Непідтримуваний тип файлу'));
    if (!isValidationError) {
        console.error(err.stack);
    }
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(200).json({ error: true, message: 'Файл занадто великий. Глобальний ліміт сервера перевищено.' });
        }
        return res.status(200).json({ error: true, message: `Помилка завантаження: ${err.message}` });
    }
    if (err.message && err.message.includes('Непідтримуваний тип файлу')) {
        return res.status(200).json({ error: true, message: err.message });
    }
    let statusCode = res.statusCode ? res.statusCode : 500;
    if (statusCode === 200) statusCode = 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;