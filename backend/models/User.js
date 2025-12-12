// backend/models/User.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async create({ username, email, password, avatar_url, is_verified, verification_token }) {
        let password_hash = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            password_hash = await bcrypt.hash(password, salt);
        }

        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash, avatar_url, is_verified, verification_token) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, password_hash, avatar_url, is_verified || 0, verification_token || null]
        );
        return { id: result.insertId, username, email, avatar_url };
    }

    static async findByEmail(email) {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.query(
            'SELECT id, username, email, role, status, platform_theme_mode, platform_theme_accent, created_at, avatar_url, last_login_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }
    
    static async findByUsername(username) {
        const [rows] = await db.query(
            'SELECT id, username, email, role, status, platform_theme_mode, platform_theme_accent, created_at, avatar_url FROM users WHERE username = ?',
            [username]
        );
        return rows[0];
    }

    static async getSiteCount(userId) {
        const [rows] = await db.query('SELECT COUNT(id) as siteCount FROM sites WHERE user_id = ?', [userId]);
        return rows[0].siteCount;
    }

    static async update(userId, { username, password, avatar_url, platform_theme_mode, platform_theme_accent }) {
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
        if (platform_theme_mode) {
            queryParts.push('platform_theme_mode = ?');
            params.push(platform_theme_mode);
        }
        if (platform_theme_accent) {
            queryParts.push('platform_theme_accent = ?');
            params.push(platform_theme_accent);
        }

        if (queryParts.length === 0) {
            return this.findById(userId);
        }

        let query = `UPDATE users SET ${queryParts.join(', ')} WHERE id = ?`;
        params.push(userId);
        
        await db.query(query, params);
        return this.findById(userId);
    }

    static async updateLastLogin(userId) {
        const [result] = await db.query(
            'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
        );
        return result;
    }

    static async deleteById(userId) {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);
        return result;
    }
    
    static async findByLoginInput(loginInput) {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [loginInput, loginInput]
        );
        return rows[0];
    }

    static async findByVerificationToken(token) {
        const [rows] = await db.query('SELECT * FROM users WHERE verification_token = ?', [token]);
        return rows[0];
    }

    static async verifyUser(userId) {
        await db.query('UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?', [userId]);
    }

    static async hasPassword(id) {
        const [rows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [id]);
        return rows[0] && rows[0].password_hash !== null;
    }
}

module.exports = User;