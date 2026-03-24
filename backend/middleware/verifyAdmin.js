// backend/middleware/verifyAdmin.js
const User = require('../models/User');

async function verifyAdmin(req, res, next) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Доступ заборонено. Потрібна автентифікація.' });
        }
        const user = await User.findById(req.user.id);
        if (!user || !['admin', 'moderator'].includes(user.role)) {
            return res.status(403).json({ message: 'Доступ заборонено. Недостатньо прав.' });
        }
        req.user.role = user.role;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Внутрішня помилка сервера під час перевірки прав.' });
    }
}

module.exports = verifyAdmin;