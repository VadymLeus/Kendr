// backend/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../config/db');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE google_id = ?', [profile.id]);
        if (existingUser.length > 0) {
            return done(null, existingUser[0]);
        }
        const email = profile.emails[0].value;
        const [userByEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        let avatar_url = null;
        if (profile.photos && profile.photos.length > 0) {
            avatar_url = profile.photos[0].value;
        }

        if (userByEmail.length > 0) {
            const user = userByEmail[0];
            const newAvatar = user.avatar_url ? user.avatar_url : avatar_url;
            await db.query(
                'UPDATE users SET google_id = ?, is_verified = 1, avatar_url = ? WHERE id = ?', 
                [profile.id, newAvatar, user.id]
            );
            return done(null, { ...user, google_id: profile.id, is_verified: 1, avatar_url: newAvatar });
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
        
        const newUser = {
            id: result.insertId,
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