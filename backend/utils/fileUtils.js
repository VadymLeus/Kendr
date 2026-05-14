// backend/utils/fileUtils.js
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const https = require('https');
const ensureDirExists = async (dirPath) => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
        console.error(`Помилка під час створення директорії ${dirPath}:`, error);
        throw error;
    }
};

const deleteFile = async (filePath) => {
    if (!filePath || filePath.includes('/default/')) {
        return;
    }
    const projectRoot = path.resolve(__dirname, '..'); 
    let fullPath;
    
    if (path.isAbsolute(filePath)) {
        fullPath = path.normalize(filePath);
    } else {
        const cleanPath = filePath.replace(/^[\/\\]+/, '');
        fullPath = path.join(projectRoot, cleanPath);
    }
    if (!fullPath.startsWith(projectRoot)) {
        console.warn(`[SECURITY WARNING] Блокирована попытка выхода за пределы директории (Path Traversal): ${filePath}`);
        return;
    }

    try {
        await fs.unlink(fullPath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(`Критическая ошибка при удалении файла ${fullPath}:`, error);
        }
    }
};

const downloadImage = (url, destPath) => {
    return new Promise((resolve, reject) => {
        const file = fsSync.createWriteStream(destPath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to download image: status ${response.statusCode}`));
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(destPath));
            });
        }).on('error', (err) => {
            fsSync.unlink(destPath, () => {});
            reject(err);
        });
    });
};

module.exports = { ensureDirExists, deleteFile, downloadImage };