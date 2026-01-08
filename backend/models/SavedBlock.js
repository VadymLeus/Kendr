// backend/models/SavedBlock.js
const db = require('../config/db');

class SavedBlock {
    static async create(userId, name, type, content) {
        const [result] = await db.query(
            'INSERT INTO saved_blocks (user_id, name, type, content) VALUES (?, ?, ?, ?)',
            [userId, name, type, JSON.stringify(content)]
        );
        return result.insertId;
    }

    static async findAllForUser(userId) {
        const [rows] = await db.query(
            'SELECT * FROM saved_blocks WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return rows.map(row => ({
            ...row,
            content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content
        }));
    }

    static async update(id, userId, data) {
        const { name, content } = data;
        let query = 'UPDATE saved_blocks SET ';
        const params = [];
        const updates = [];

        if (name) {
            updates.push('name = ?');
            params.push(name);
        }
        if (content) {
            updates.push('content = ?');
            params.push(JSON.stringify(content));
        }

        if (updates.length === 0) return false;

        query += updates.join(', ') + ' WHERE id = ? AND user_id = ?';
        params.push(id, userId);

        const [result] = await db.query(query, params);
        return result.affectedRows > 0;
    }

    static async delete(id, userId) {
        const [result] = await db.query(
            'DELETE FROM saved_blocks WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = SavedBlock;