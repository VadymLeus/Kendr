// backend/models/Favorite.js
const db = require('../db');

class Favorite {
    // Додати сайт до обраних
    static async add(userId, siteId) {
        const [result] = await db.query(
            'INSERT INTO user_favorites (user_id, site_id) VALUES (?, ?)',
            [userId, siteId]
        );
        return result;
    }

    // Видалити сайт з обраних
    static async remove(userId, siteId) {
        const [result] = await db.query(
            'DELETE FROM user_favorites WHERE user_id = ? AND site_id = ?',
            [userId, siteId]
        );
        return result;
    }

    // Отримати всі обрані сайти для користувача (з повною інформацією)
    static async findForUser(userId) {
        const [rows] = await db.query(`
            SELECT
                s.id, s.site_path, s.title, s.logo_url, s.status,
                t.name AS templateName,
                u.username AS author
            FROM sites s
            JOIN user_favorites uf ON s.id = uf.site_id
            JOIN users u ON s.user_id = u.id
            JOIN templates t ON s.template_id = t.id
            WHERE uf.user_id = ? AND s.status = 'published'
            ORDER BY uf.created_at DESC
        `, [userId]);
        return rows;
    }

    // Отримати тільки ID обраних сайтів для швидкої перевірки
    static async findIdsForUser(userId) {
        const [rows] = await db.query(
            'SELECT site_id FROM user_favorites WHERE user_id = ?',
            [userId]
        );
        return rows.map(row => row.site_id);
    }
}

module.exports = Favorite;