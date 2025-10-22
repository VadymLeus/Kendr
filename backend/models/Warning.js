// backend/models/Warning.js
const db = require('../db');

class Warning {
    // Створити нове попередження
    static async create(userId, siteId, reason = null) {
        await db.query(
            'INSERT INTO user_warnings (user_id, site_id, reason_note) VALUES (?, ?, ?)',
            [userId, siteId, reason]
        );
    }

    // Порахувати кількість активних попереджень у користувача
    static async countForUser(userId) {
        const [rows] = await db.query('SELECT COUNT(id) as warningCount FROM user_warnings WHERE user_id = ?', [userId]);
        return rows[0].warningCount;
    }

    // Видалити попередження, пов'язане з конкретним сайтом (при відновленні)
    static async removeBySiteId(siteId) {
        await db.query('DELETE FROM user_warnings WHERE site_id = ?', [siteId]);
    }

    // Знайти всі попередження для користувача (для відображення в профілі)
    static async findForUser(userId) {
        const [rows] = await db.query('SELECT id, site_id, created_at FROM user_warnings WHERE user_id = ? ORDER BY created_at ASC', [userId]);
        return rows;
    }
}

module.exports = Warning;