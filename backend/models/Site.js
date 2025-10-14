const db = require('../db');
const TemplateService = require('../utils/templateService');
const { deleteFile } = require('../utils/fileUtils');

class Site {
    /**
     * Отримує список сайтів.
     * Якщо передано `userId`, повертає всі сайти цього користувача (включаючи чернетки).
     * Якщо `userId` не передано, повертає тільки опубліковані сайти для загального каталогу.
     */
    static async getPublic(searchTerm = '', userId = null) {
        let query = `
            SELECT
                s.id, s.site_path, s.title, s.logo_url, s.status,
                t.name AS templateName,
                t.thumbnail_url AS templateThumbnail,
                u.username AS author
            FROM sites s
            JOIN templates t ON s.template_id = t.id
            JOIN users u ON s.user_id = u.id
        `;
        const params = [];

        // Запит для конкретного користувача ("Мої сайти")
        if (userId) {
            query += ' WHERE s.user_id = ?';
            params.push(userId);
            if (searchTerm) {
                query += ' AND s.title LIKE ?';
                params.push(`%${searchTerm}%`);
            }
        } 
        // Запит для загального каталогу
        else {
            query += " WHERE s.status = 'published'";
            if (searchTerm) {
                query += ' AND s.title LIKE ?';
                params.push(`%${searchTerm}%`);
            }
        }

        query += ' ORDER BY s.created_at DESC';

        const [rows] = await db.query(query, params);
        return rows;
    }

    // Отримати список усіх доступних шаблонів
    static async getTemplates() {
        const [rows] = await db.query('SELECT * FROM templates');
        return rows;
    }

    // Створити новий сайт
    static async create(userId, templateId, sitePath, title, logoUrl) {
        try {
            if (!userId || !templateId || !sitePath || !title) {
                throw new Error('Всі поля є обов\'язковими для заповнення');
            }
            
            if (sitePath.length < 3 || !/^[a-z0-9-]+$/.test(sitePath)) {
                throw new Error('Некоректний шлях сайту. Дозволені лише латинські літери, цифри та дефіси');
            }

            const [templatesFromDb] = await db.query('SELECT * FROM templates WHERE id = ?', [templateId]);
            if (!templatesFromDb.length) {
                throw new Error('Шаблон не знайдено в базі даних');
            }
            const templateData = templatesFromDb[0];

            const templateFolderName = templateData.folder_name;
            if (!templateFolderName) {
                throw new Error(`Критична помилка: для шаблону з ID ${templateId} не вказано ім'я папки в базі даних.`);
            }

            const [existingSites] = await db.query('SELECT id FROM sites WHERE site_path = ?', [sitePath]);
            if (existingSites.length > 0) {
                throw new Error('Сайт з таким шляхом вже існує');
            }
            
            const templateConfig = await TemplateService.getConfigById(templateFolderName);
            if (!templateConfig) {
                throw new Error(`Конфігурацію для шаблону '${templateFolderName}' не знайдено у файловій системі`);
            }

            const [result] = await db.query(
                'INSERT INTO sites (user_id, template_id, site_path, title, logo_url) VALUES (?, ?, ?, ?, ?)',
                [userId, templateData.id, sitePath, title, logoUrl]
            );
            const siteId = result.insertId;

            // Створення контенту за замовчуванням для нового сайту
            if (templateConfig && templateConfig.defaultContent) {
                await this._createDefaultContent(siteId, templateConfig.defaultContent, title);
            }

            return { id: siteId, site_path: sitePath };
        } catch (error) {
            throw error; 
        }
    }

    // Внутрішній метод для створення початкового контенту сайту
    static async _createDefaultContent(siteId, defaultContent, title) {
        const variables = {
            title: title,
            year: new Date().getFullYear(),
            date: new Date().toLocaleDateString('uk-UA')
        };
        const contentValues = defaultContent.map(contentItem => {
            const value = this._replacePlaceholders(contentItem.value, variables);
            return [siteId, contentItem.key, value];
        });
        if (contentValues.length > 0) {
            const placeholders = contentValues.map(() => '(?, ?, ?)').join(', ');
            await db.query(
                `INSERT INTO site_content (site_id, content_key, content_value) VALUES ${placeholders}`,
                contentValues.flat()
            );
        }
    }

    // Внутрішній метод для заміни плейсхолдерів (наприклад, {year})
    static _replacePlaceholders(value, variables = {}) {
        return value.replace(/\{(\w+)\}/g, (match, key) => {
            return variables[key] !== undefined ? variables[key] : match;
        });
    }

    // Знайти сайт за його унікальним шляхом (site_path)
    static async findByPath(sitePath) {
        const [sites] = await db.query(`
            SELECT
                s.id, s.user_id, s.title, s.template_id, s.status, s.logo_url,
                s.site_path, s.view_count,
                t.component_name
            FROM sites s
            JOIN templates t ON s.template_id = t.id
            WHERE s.site_path = ?
        `, [sitePath]);
        if (!sites[0]) return null;

        const site = sites[0];
        
        const [contentRows] = await db.query('SELECT content_key, content_value FROM site_content WHERE site_id = ?', [site.id]);
        const content = contentRows.reduce((acc, row) => {
            acc[row.content_key] = row.content_value;
            return acc;
        }, {});
        
        let products = [];
        // Якщо ID шаблону = 2 (магазин), завантажуємо також товари
        if (site.template_id == 2) { 
            const [productRows] = await db.query(`
                SELECT p.*, c.name as category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.site_id = ?
                ORDER BY c.name, p.created_at DESC
            `, [site.id]);
            products = productRows;
        }
        
        return { ...site, content, products };
    }

    // Збільшує лічильник переглядів сайту на 1
    static async incrementViewCount(siteId) {
        await db.query(
            'UPDATE sites SET view_count = view_count + 1 WHERE id = ?',
            [siteId]
        );
    }

    // Оновити або додати новий елемент контенту сайту
    static async updateContent(siteId, contentKey, contentValue) {
        const [rows] = await db.query(
            'SELECT id FROM site_content WHERE site_id = ? AND content_key = ?',
            [siteId, contentKey]
        );
        if (rows.length > 0) {
            return await db.query(
                'UPDATE site_content SET content_value = ? WHERE site_id = ? AND content_key = ?',
                [contentValue, siteId, contentKey]
            );
        } else {
            return await db.query(
                'INSERT INTO site_content (site_id, content_key, content_value) VALUES (?, ?, ?)',
                [siteId, contentKey, contentValue]
            );
        }
    }

    // Знайти сайт за ID та ID власника
    static async findByIdAndUserId(siteId, userId) {
        const [rows] = await db.query(
            'SELECT * FROM sites WHERE id = ? AND user_id = ?',
            [siteId, userId]
        );
        return rows[0];
    }

    // Оновлює назву та статус сайту (наприклад, 'published' або 'draft')
    static async updateSettings(siteId, data) {
        const { title, status } = data;
        const [result] = await db.query(
            'UPDATE sites SET title = ?, status = ? WHERE id = ?',
            [title, status, siteId]
        );
        return result;
    }

    // Оновлює теги, прив'язані до сайту
    static async updateTags(siteId, tagIds = []) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            // 1. Видаляємо всі старі теги для цього сайту
            await connection.query('DELETE FROM site_tags WHERE site_id = ?', [siteId]);
            
            // 2. Якщо є нові теги, додаємо їх
            if (tagIds.length > 0) {
                const values = tagIds.map(tagId => [siteId, tagId]);
                await connection.query('INSERT INTO site_tags (site_id, tag_id) VALUES ?', [values]);
            }
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Видалити сайт за його ID
    static async delete(siteId) {
        const [result] = await db.query('DELETE FROM sites WHERE id = ?', [siteId]);
        return result;
    }

    // Видалити сайт за його шляхом та ID власника
    static async deleteByPathAndUserId(sitePath, userId) {
        const [sites] = await db.query(
            'SELECT id, logo_url FROM sites WHERE site_path = ? AND user_id = ?',
            [sitePath, userId]
        );

        if (sites.length === 0) {
            return null;
        }

        const siteToDelete = sites[0];
        const { id: siteId, logo_url: logoUrl } = siteToDelete;

        const result = await this.delete(siteId);

        // Якщо логотип не стандартний, видаляємо його файл
        if (logoUrl && !logoUrl.includes('/default/')) {
            await deleteFile(logoUrl);
        }
        
        return result;
    }

    // Отримати всі сайти, що належать конкретному користувачу
    static async getUserSites(userId) {
        const [rows] = await db.query(`
            SELECT s.*, t.name as template_name, t.thumbnail_url
            FROM sites s 
            JOIN templates t ON s.template_id = t.id 
            WHERE s.user_id = ? 
            ORDER BY s.created_at DESC
        `, [userId]);
        return rows;
    }
}

module.exports = Site;