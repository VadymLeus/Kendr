// backend/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../config/db');
const path = require('path');
const { downloadImage, ensureDirExists } = require('../utils/fileUtils');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE google_id = ?', [profile.id]);
        
        if (existingUser.length > 0) {
            return done(null, existingUser[0]);
        }

        const email = profile.emails[0].value;
        const [userByEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        let avatar_url = '/uploads/avatars/default/avatar1.png';
        let mediaId = null;

        if (profile.photos && profile.photos.length > 0) {
            try {
                const googlePhotoUrl = profile.photos[0].value;
                const filename = `google-${profile.id}-${Date.now()}.jpg`;
                const uploadDir = path.join(__dirname, '..', 'uploads', 'media');
                const relativePath = `/uploads/media/${filename}`;
                
                await ensureDirExists(uploadDir);
                await downloadImage(googlePhotoUrl, path.join(uploadDir, filename));
                
                avatar_url = relativePath;
            } catch (imgError) {
                console.error("Google avatar download failed:", imgError);
            }
        }

        if (userByEmail.length > 0) {
            const user = userByEmail[0];
            await db.query(
                'UPDATE users SET google_id = ?, is_verified = 1, avatar_url = ? WHERE id = ?', 
                [profile.id, avatar_url, user.id]
            );
            
            if (avatar_url.includes('google-')) {
                 await db.query(
                    `INSERT INTO user_media (user_id, path_full, path_thumb, original_file_name, mime_type, file_size_kb, file_type) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [user.id, avatar_url, avatar_url, 'google_avatar.jpg', 'image/jpeg', 0, 'image']
                );
            }
            
            return done(null, { ...user, google_id: profile.id, is_verified: 1, avatar_url });
        }

        const baseUsername = profile.displayName.replace(/\s+/g, '_');
        let uniqueUsername = baseUsername;
        
        while (true) {
             const [check] = await db.query('SELECT id FROM users WHERE username = ?', [uniqueUsername]);
             if (check.length === 0) break;
             uniqueUsername = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;
        }

        const [result] = await db.query(
            'INSERT INTO users (username, email, google_id, avatar_url, is_verified, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
            [uniqueUsername, email, profile.id, avatar_url, 1, null]
        );
        
        const newUserId = result.insertId;

        if (avatar_url.includes('google-')) {
             await db.query(
                `INSERT INTO user_media (user_id, path_full, path_thumb, original_file_name, mime_type, file_size_kb, file_type) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [newUserId, avatar_url, avatar_url, 'google_avatar.jpg', 'image/jpeg', 0, 'image']
            );
        }

        const newUser = {
            id: newUserId,
            username: uniqueUsername,
            email: email,
            role: 'user',
            avatar_url: avatar_url
        };

        return done(null, newUser);

    } catch (err) {
        return done(err, null);
    }
  }
));

module.exports = passport;