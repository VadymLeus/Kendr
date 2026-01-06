// backend/models/Media.js
const db = require('../config/db');

class Media {
    static async create(mediaData) {
        const { 
            userId, 
            path_full, 
            path_thumb, 
            original_file_name, 
            mime_type, 
            file_size_kb,
            file_type,
            width,          // Нове
            height,         // Нове
            display_name,   // Нове: ім'я для відображення без розширення
            is_system       // Нове: чи це технічний файл
        } = mediaData;
        
        // Генеруємо display_name з оригінального імені, якщо воно не передано
        const finalDisplayName = display_name || original_file_name.split('.').slice(0, -1).join('.') || 'image';
        const finalIsSystem = is_system === true || is_system === 'true' ? 1 : 0;

        const [result] = await db.query(
            `INSERT INTO user_media 
             (user_id, path_full, path_thumb, original_file_name, display_name, mime_type, file_size_kb, file_type, width, height, is_system) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, 
                path_full, 
                path_thumb || null, 
                original_file_name, 
                finalDisplayName,
                mime_type, 
                file_size_kb, 
                file_type || 'image',
                width || null,
                height || null,
                finalIsSystem
            ]
        );
        
        return this.findById(result.insertId);
    }

    // Отримання бібліотеки (тільки НЕ системні файли)
    static async findByUserId(userId) {
        const [rows] = await db.query(
            `SELECT * FROM user_media 
             WHERE user_id = ? AND is_system = 0 
             ORDER BY created_at DESC`,
            [userId]
        );
        return rows;
    }

    // Пошук конкретного файлу (тут можна віддавати і системні, якщо знаємо ID)
    static async findById(mediaId) {
        const [rows] = await db.query('SELECT * FROM user_media WHERE id = ?', [mediaId]);
        return rows[0];
    }

    static async delete(mediaId) {
        // Спочатку отримуємо шлях до файлу, щоб видалити його фізично (це робиться в контролері),
        // тут тільки видалення запису з БД
        const [result] = await db.query('DELETE FROM user_media WHERE id = ?', [mediaId]);
        return result;
    }

    static async updateDetails(mediaId, data) {
        const { alt_text, display_name, description, is_favorite } = data;
        
        // Динамічно формуємо запит оновлення
        const updates = [];
        const values = [];

        if (alt_text !== undefined) { updates.push('alt_text = ?'); values.push(alt_text); }
        if (display_name !== undefined) { updates.push('display_name = ?'); values.push(display_name); }
        if (description !== undefined) { updates.push('description = ?'); values.push(description); }
        if (is_favorite !== undefined) { updates.push('is_favorite = ?'); values.push(is_favorite); }

        if (updates.length === 0) return null;

        values.push(mediaId);

        const [result] = await db.query(
            `UPDATE user_media SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        return result;
    }
}

module.exports = Media;