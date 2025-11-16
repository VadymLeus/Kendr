// backend/models/Media.js
const db = require('../db');

class Media {
    static async create(mediaData) {
        const { 
            userId, 
            path_full, 
            path_thumb, 
            original_file_name, 
            mime_type, 
            file_size_kb 
        } = mediaData;
        
        const [result] = await db.query(
            `INSERT INTO user_media 
             (user_id, path_full, path_thumb, original_file_name, alt_text, mime_type, file_size_kb) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, path_full, path_thumb, original_file_name, null, mime_type, file_size_kb]
        );
        
        return this.findById(result.insertId);
    }

    static async findByUserId(userId) {
        const [rows] = await db.query(
            'SELECT * FROM user_media WHERE user_id = ? ORDER BY uploaded_at DESC',
            [userId]
        );
        return rows;
    }

    static async findById(mediaId) {
        const [rows] = await db.query('SELECT * FROM user_media WHERE id = ?', [mediaId]);
        return rows[0];
    }

    static async delete(mediaId) {
        const [result] = await db.query('DELETE FROM user_media WHERE id = ?', [mediaId]);
        return result;
    }

    static async updateAlt(mediaId, altText) {
        const [result] = await db.query(
            'UPDATE user_media SET alt_text = ? WHERE id = ?',
            [altText, mediaId]
        );
        return result;
    }
}

module.exports = Media;