// backend/models/UserTemplate.js
const db = require('../config/db');

class UserTemplate {
    static async create(userId, name, description, icon, category, snapshot) {
        const [result] = await db.query(
            `INSERT INTO templates 
            (user_id, name, description, icon, category, default_block_content, type, access_level, is_ready) 
            VALUES (?, ?, ?, ?, ?, ?, 'personal', 'private', 1)`,
            [userId, name, description, icon, category || 'General', JSON.stringify(snapshot)]
        );
        return result.insertId;
    }

    static async findAllForUser(userId) {
        const [rows] = await db.query(
            `SELECT id, name, description, icon, category, default_block_content, created_at 
             FROM templates 
             WHERE user_id = ? AND type = 'personal' 
             ORDER BY created_at DESC`,
            [userId]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(
            'SELECT * FROM templates WHERE id = ?',
            [id]
        );
        
        if (rows[0]) {
            let content = rows[0].default_block_content;
            if (typeof content === 'string') {
                try {
                    content = JSON.parse(content);
                } catch (e) {
                    content = {};
                }
            }
            rows[0].default_block_content = content;
            rows[0].full_site_snapshot = content; 
        }
        return rows[0];
    }

    static async update(id, userId, name, description, icon, category, snapshot) {
        const [result] = await db.query(
            `UPDATE templates 
             SET name = ?, description = ?, icon = ?, category = ?, default_block_content = ?, created_at = NOW() 
             WHERE id = ? AND user_id = ? AND type = 'personal'`,
            [name, description, icon, category || 'General', JSON.stringify(snapshot), id, userId]
        );
        return result.affectedRows > 0;
    }

    static async updateInfo(id, userId, name, description, icon, category) {
        const [result] = await db.query(
            `UPDATE templates SET name = ?, description = ?, icon = ?, category = ? 
             WHERE id = ? AND user_id = ? AND type = 'personal'`,
            [name, description, icon, category || 'General', id, userId]
        );
        return result.affectedRows > 0;
    }

    static async delete(id, userId) {
        const [result] = await db.query(
            `DELETE FROM templates WHERE id = ? AND user_id = ? AND type = 'personal'`,
            [id, userId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = UserTemplate;