// backend/models/Favorite.js
const db = require('../db');

class Favorite {
    static async add(userId, siteId) {
        const [result] = await db.query(
            'INSERT INTO user_favorites (user_id, site_id) VALUES (?, ?)',
            [userId, siteId]
        );
        return result;
    }

    static async remove(userId, siteId) {
        const [result] = await db.query(
            'DELETE FROM user_favorites WHERE user_id = ? AND site_id = ?',
            [userId, siteId]
        );
        return result;
    }

    static async findForUser(userId) {
        const [rows] = await db.query(`
            SELECT
                s.id,
                s.site_path,
                s.title,
                s.logo_url,
                s.status,
                s.view_count,
                s.site_theme_mode,
                s.site_theme_accent,
                u.username AS owner_username
            FROM user_favorites uf
            JOIN sites s ON uf.site_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE uf.user_id = ?
            ORDER BY uf.created_at DESC
        `, [userId]);
        return rows;
    }

    static async findIdsForUser(userId) {
        const [rows] = await db.query(
            'SELECT site_id FROM user_favorites WHERE user_id = ?',
            [userId]
        );
        return rows.map(row => row.site_id);
    }
}

module.exports = Favorite;