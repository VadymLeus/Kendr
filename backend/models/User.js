// backend/models/User.js
const db = require('../db');
const bcrypt = require('bcryptjs');

class User {
    // Створити нового користувача
    static async create({ username, email, password, avatar_url }) {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash, avatar_url) VALUES (?, ?, ?, ?)',
            [username, email, password_hash, avatar_url]
        );
        return { id: result.insertId, username, email, avatar_url };
    }

    // Знайти користувача за email
    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    // Знайти користувача за ID
    static async findById(id) {
        const [rows] = await db.query('SELECT id, username, email, role, created_at, avatar_url FROM users WHERE id = ?', [id]);
        return rows[0];
    }
    
    // Знайти користувача за іменем (username)
    static async findByUsername(username) {
        const [rows] = await db.query('SELECT id, username, email, role, created_at, avatar_url FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    // Отримати кількість сайтів, створених користувачем
    static async getSiteCount(userId) {
        const [rows] = await db.query('SELECT COUNT(id) as siteCount FROM sites WHERE user_id = ?', [userId]);
        return rows[0].siteCount;
    }

    // Оновити дані користувача (ім'я, пароль, аватар)
    static async update(userId, { username, password, avatar_url }) {
        let queryParts = [];
        const params = [];

        if (username) {
            queryParts.push('username = ?');
            params.push(username);
        }
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            queryParts.push('password_hash = ?');
            params.push(password_hash);
        }
        if (avatar_url) {
            queryParts.push('avatar_url = ?');
            params.push(avatar_url);
        }

        if (queryParts.length === 0) {
            return this.findById(userId); // Повертаємо поточні дані, якщо нічого не змінюється
        }

        let query = `UPDATE users SET ${queryParts.join(', ')} WHERE id = ?`;
        params.push(userId);
        
        await db.query(query, params);
        return this.findById(userId);
    }

    // НОВИЙ МЕТОД
    // Оновлює час останнього входу для користувача
    static async updateLastLogin(userId) {
        const [result] = await db.query(
            'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
        );
        return result;
    }
}

module.exports = User;