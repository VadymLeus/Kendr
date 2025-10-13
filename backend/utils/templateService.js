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
                // Використовуємо ім'я папки як унікальний ідентифікатор
                config.id = folder;
                templates.push(config);
            } catch (error) {
                console.error(`Помилка читання конфігурації для шаблону ${folder}:`, error);
            }
        }
        return templates;
    }

    // Синхронізує шаблони з файлової системи з базою даних
    static async syncWithDB() {
        const fileTemplates = await this.discoverTemplates();
        console.log('Виявлені шаблони:', fileTemplates.map(t => t.name).join(', '));

        for (const tpl of fileTemplates) {
            // Перевіряємо існування за іменем папки
            const [existing] = await db.query('SELECT * FROM templates WHERE folder_name = ?', [tpl.id]);
            
            if (existing.length === 0) {
                console.log(`Додавання нового шаблону в БД: ${tpl.name}`);
                // Додаємо folder_name під час вставки
                await db.query(
                    'INSERT INTO templates (name, component_name, folder_name, description, thumbnail_url) VALUES (?, ?, ?, ?, ?)',
                    [tpl.name, tpl.componentName, tpl.id, tpl.description, tpl.thumbnailUrl]
                );
            } else {
                // У майбутньому тут можна додати логіку оновлення даних (назва, опис тощо)
            }
        }
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