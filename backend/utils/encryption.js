// backend/utils/encryption.js
const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; 
const ALGORITHM = 'aes-256-gcm';
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    console.error('КРИТИЧНА ПОМИЛКА: ENCRYPTION_KEY у .env має містити рівно 32 символи.');
    process.exit(1);
}

exports.encrypt = (text) => {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
        console.error('Помилка шифрування:', error);
        return null;
    }
};

exports.decrypt = (hash) => {
    if (!hash) return hash;
    const parts = hash.split(':');
    if (parts.length !== 3) {
        return hash; 
    }
    
    try {
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encryptedText = parts[2];
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Помилка розшифрування (невірний ключ або пошкоджені дані):', error);
        return null;
    }
};