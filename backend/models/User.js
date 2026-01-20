// backend/models/User.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
class User {
    static async create({ username, email, password, avatar_url, is_verified, verification_token, google_id }) {
        let password_hash = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            password_hash = await bcrypt.hash(password, salt);
        }

        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash, avatar_url, is_verified, verification_token, google_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, email, password_hash, avatar_url, is_verified || 0, verification_token || null, google_id || null]
        );
        return { id: result.insertId, username, email, avatar_url };
    }

    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.query(
            `SELECT id, username, email, phone_number, role, status, 
            platform_theme_mode, platform_theme_accent, 
            platform_bg_url, platform_bg_blur, platform_bg_brightness,
            bio, social_telegram, social_instagram, social_website, is_profile_public,
            created_at, avatar_url, last_login_at 
            FROM users WHERE id = ?`,
            [id]
        );
        return rows[0];
    }
    
    static async findByUsername(username) {
        const [rows] = await db.query(
            `SELECT id, username, email, role, status, 
            platform_theme_mode, platform_theme_accent, 
            bio, social_telegram, social_instagram, social_website, is_profile_public,
            created_at, avatar_url 
            FROM users WHERE username = ?`,
            [username]
        );
        return rows[0];
    }

static async getSiteCount(userId) {
        const [rows] = await db.query('SELECT COUNT(id) as siteCount FROM sites WHERE user_id = ? AND status = "published"', [userId]);
        return rows[0].siteCount;
    }

    static async getTotalSiteViews(userId) {
        const [rows] = await db.query(
            'SELECT COALESCE(SUM(view_count), 0) as totalViews FROM sites WHERE user_id = ? AND status = "published"', 
            [userId]
        );
        return rows[0].totalViews; 
    }

    static async update(userId, data) {
        const { 
            username, password, password_hash,
            avatar_url, phone_number,
            platform_theme_mode, platform_theme_accent,
            platform_bg_url, platform_bg_blur, platform_bg_brightness,
            bio, social_telegram, social_instagram, social_website, is_profile_public
        } = data;

        let queryParts = [];
        const params = [];
        if (username !== undefined) { queryParts.push('username = ?'); params.push(username); }
        
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);
            queryParts.push('password_hash = ?'); params.push(hashed);
        } 
        else if (password_hash !== undefined) {
            queryParts.push('password_hash = ?'); params.push(password_hash);
        }

        if (avatar_url !== undefined) { queryParts.push('avatar_url = ?'); params.push(avatar_url); }
        if (phone_number !== undefined) { queryParts.push('phone_number = ?'); params.push(phone_number); }
        if (platform_theme_mode !== undefined) { queryParts.push('platform_theme_mode = ?'); params.push(platform_theme_mode); }
        if (platform_theme_accent !== undefined) { queryParts.push('platform_theme_accent = ?'); params.push(platform_theme_accent); }
        if (platform_bg_url !== undefined) { queryParts.push('platform_bg_url = ?'); params.push(platform_bg_url); }
        if (platform_bg_blur !== undefined) { queryParts.push('platform_bg_blur = ?'); params.push(platform_bg_blur); }
        if (platform_bg_brightness !== undefined) { queryParts.push('platform_bg_brightness = ?'); params.push(platform_bg_brightness); }
        if (bio !== undefined) { queryParts.push('bio = ?'); params.push(bio); }
        if (social_telegram !== undefined) { queryParts.push('social_telegram = ?'); params.push(social_telegram); }
        if (social_instagram !== undefined) { queryParts.push('social_instagram = ?'); params.push(social_instagram); }
        if (social_website !== undefined) { queryParts.push('social_website = ?'); params.push(social_website); }
        if (is_profile_public !== undefined) { queryParts.push('is_profile_public = ?'); params.push(is_profile_public); }
        if (queryParts.length === 0) {
            return this.findById(userId);
        }

        let query = `UPDATE users SET ${queryParts.join(', ')} WHERE id = ?`;
        params.push(userId);
        await db.query(query, params);
        return this.findById(userId);
    }

    static async updateLastLogin(userId) {
        await db.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
    }

    static async deleteById(userId) {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);
        return result;
    }
    
    static async findByLoginInput(loginInput) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [loginInput, loginInput]);
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
        return rows[0] && rows[0].password_hash !== null && rows[0].password_hash !== '';
    }
}

module.exports = User;