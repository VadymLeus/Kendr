// backend/models/UserTemplate.js
const db = require('../config/db');

class UserTemplate {
    static async create(userId, name, description, snapshot) {
        const [result] = await db.query(
            'INSERT INTO user_templates (user_id, name, description, full_site_snapshot) VALUES (?, ?, ?, ?)',
            [userId, name, description, JSON.stringify(snapshot)]
        );
        return result.insertId;
    }

    static async findAllForUser(userId) {
        const [rows] = await db.query(
            'SELECT id, name, description, created_at FROM user_templates WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(
            'SELECT * FROM user_templates WHERE id = ?',
            [id]
        );
        if (rows[0] && typeof rows[0].full_site_snapshot === 'string') {
            rows[0].full_site_snapshot = JSON.parse(rows[0].full_site_snapshot);
        }
        return rows[0];
    }

    static async update(id, userId, name, description, snapshot) {
        const [result] = await db.query(
            'UPDATE user_templates SET name = ?, description = ?, full_site_snapshot = ?, created_at = NOW() WHERE id = ? AND user_id = ?',
            [name, description, JSON.stringify(snapshot), id, userId]
        );
        return result.affectedRows > 0;
    }

    static async delete(id, userId) {
        const [result] = await db.query(
            'DELETE FROM user_templates WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = UserTemplate;