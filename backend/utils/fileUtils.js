// backend/utils/fileUtils.js
const fs = require('fs').promises;
const path = require('path');

/**
 * Перевіряє, чи існує директорія, і створює її, якщо ні.
 * @param {string} dirPath - Шлях до директорії.
 */
const ensureDirExists = async (dirPath) => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
        console.error(`Помилка під час створення директорії ${dirPath}:`, error);
        throw error;
    }
};

/**
 * Безпечно видаляє файл за його відносним шляхом від кореня проєкту.
 * @param {string | null | undefined} relativePath - Шлях до файлу (наприклад, /uploads/avatars/custom/avatar.webp).
 */
const deleteFile = async (relativePath) => {
    // 1. Перевіряємо, чи шлях існує і не веде до стандартних файлів, які не можна видаляти.
    if (!relativePath || relativePath.includes('/default/')) {
        console.log(`Видалення файлу пропущено (стандартний або порожній шлях): ${relativePath}`);
        return;
    }

    // 2. Нормалізуємо шлях: прибираємо початковий слеш, якщо він є.
    const normalizedPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    const fullPath = path.join(__dirname, '..', normalizedPath);

    try {
        // 3. Намагаємося видалити файл.
        await fs.unlink(fullPath);
        console.log(`Файл ${fullPath} успішно видалено.`);
    } catch (error) {
        // Якщо файлу не існує (код ENOENT), це не помилка, просто його вже немає.
        if (error.code !== 'ENOENT') {
            console.error(`КРИТИЧНА ПОМИЛКА під час видалення файлу ${fullPath}:`, error);
        } else {
            console.log(`Файл ${fullPath} не знайдено для видалення (можливо, вже видалений).`);
        }
    }
};

module.exports = { ensureDirExists, deleteFile };