// backend/models/Media.js
const db = require('../db');

class Media {
    /**
     * Створює новий запис про медіафайл у БД
     * @param {object} mediaData - Дані медіафайлу
     * @param {number} mediaData.userId - ID користувача
     * @param {string} mediaData.path_full - Шлях до повного зображення
     * @param {string} mediaData.path_thumb - Шлях до мініатюри
     * @param {string} mediaData.original_file_name - Оригінальна назва файлу
     * @param {string} mediaData.mime_type - MIME тип
     * @param {number} mediaData.file_size_kb - Розмір файлу в КБ
     */
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

    /**
     * Знаходить всі медіафайли для користувача
     * @param {number} userId - ID користувача
     */
    static async findByUserId(userId) {
        const [rows] = await db.query(
            'SELECT * FROM user_media WHERE user_id = ? ORDER BY uploaded_at DESC',
            [userId]
        );
        return rows;
    }

    /**
     * Знаходить медіафайл за ID
     * @param {number} mediaId - ID медіафайлу
     */
    static async findById(mediaId) {
        const [rows] = await db.query('SELECT * FROM user_media WHERE id = ?', [mediaId]);
        return rows[0];
    }

    /**
     * Видаляє запис про медіафайл з БД
     * @param {number} mediaId - ID медіафайлу
     */
    static async delete(mediaId) {
        const [result] = await db.query('DELETE FROM user_media WHERE id = ?', [mediaId]);
        return result;
    }

    /**
     * Оновлює alt-текст для зображення
     * @param {number} mediaId - ID медіафайлу
     * @param {string} altText - Новий alt-текст
     */
    static async updateAlt(mediaId, altText) {
        const [result] = await db.query(
            'UPDATE user_media SET alt_text = ? WHERE id = ?',
            [altText, mediaId]
        );
        return result;
    }
}

module.exports = Media;