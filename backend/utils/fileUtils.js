// backend/utils/fileUtils.js
const fs = require('fs').promises;
const path = require('path');

const ensureDirExists = async (dirPath) => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
        console.error(`Помилка під час створення директорії ${dirPath}:`, error);
        throw error;
    }
};

const deleteFile = async (relativePath) => {
    if (!relativePath || relativePath.includes('/default/')) {
        console.log(`Видалення файлу пропущено (стандартний або порожній шлях): ${relativePath}`);
        return;
    }

    const normalizedPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    const fullPath = path.join(__dirname, '..', normalizedPath);

    try {
        await fs.unlink(fullPath);
        console.log(`Файл ${fullPath} успішно видалено.`);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(`КРИТИЧНА ПОМИЛКА під час видалення файлу ${fullPath}:`, error);
        } else {
            console.log(`Файл ${fullPath} не знайдено для видалення (можливо, вже видалений).`);
        }
    }
};

module.exports = { ensureDirExists, deleteFile };