// backend/utils/adminLogger.js
const db = require('../config/db');
const logAdminAction = async (req, actionType, targetType, targetId, details = {}) => {
    try {
        if (!req.user || !req.user.id) {
            return;
        }
        const adminId = req.user.id;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const detailsJson = JSON.stringify(details);
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