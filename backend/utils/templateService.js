// backend/utils/templateService.js
const fs = require('fs').promises;
const path = require('path');
const db = require('../db');
const templatesDir = path.join(__dirname, '..', 'templates');

class TemplateService {
    // Сканує директорію та завантажує конфігурації шаблонів із файлів config.json
    static async discoverTemplates() {
        const templateFolders = await fs.readdir(templatesDir);
        const templates = [];

        for (const folder of templateFolders) {
            const configPath = path.join(templatesDir, folder, 'config.json');
            try {
                const content = await fs.readFile(configPath, 'utf-8');
                const config = JSON.parse(content);
                config.id = folder;
                templates.push(config);
            } catch (error) {
                console.error(`Помилка читання конфігурації для шаблону ${folder}:`, error);
            }
        }
        return templates;
    }

    static async syncWithDB() {
        console.log('Виявлені шаблони: (синхронізацію з БД вимкнено для нової блочної системи)');
    }
    
    // Отримати конфігурацію одного шаблону за іменем його папки
    static async getConfigById(folderName) {
        const configPath = path.join(templatesDir, folderName, 'config.json');
        try {
            const content = await fs.readFile(configPath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            return null;
        }
    }
}

module.exports = TemplateService;