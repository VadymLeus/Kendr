const db = require('../config/db');
const logAdminAction = async (req, actionType, targetType, targetId, details = {}) => {
    try {
        if (!req.user || !req.user.id) {
            console.warn('AdminLogger: Спроба логування без авторизованого користувача.');
            return;
        }

        const adminId = req.user.id;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const detailsJson = JSON.stringify(details);
        console.log(`AdminLogger: Запис логу -> Адмін: ${adminId}, Дія: ${actionType}`);

        await db.query(
            `INSERT INTO admin_logs (admin_id, action_type, target_type, target_id, details, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [adminId, actionType, targetType, targetId, detailsJson, ip]
        );
        
    } catch (error) {
        console.error('AdminLogger Error:', error);
    }
};

module.exports = logAdminAction;