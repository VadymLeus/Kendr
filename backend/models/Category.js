// backend/models/Category.js
const db = require('../db');

class Category {
    // Знайти всі категорії для конкретного сайту
    static async findBySiteId(siteId) {
        const [rows] = await db.query(
            'SELECT * FROM categories WHERE site_id = ? ORDER BY name ASC',
            [siteId]
        );
        return rows;
    }

    // Створити нову категорію
    static async create(siteId, name) {
        const [result] = await db.query(
            'INSERT INTO categories (site_id, name) VALUES (?, ?)',
            [siteId, name]
        );
        return { id: result.insertId, site_id: siteId, name };
    }

    // Видалити категорію
    static async delete(categoryId) {
        // При видаленні категорії, у пов'язаних товарів category_id стане NULL завдяки ON DELETE SET NULL
        const [result] = await db.query(
            'DELETE FROM categories WHERE id = ?',
            [categoryId]
        );
        return result;
    }
}

module.exports = Category;