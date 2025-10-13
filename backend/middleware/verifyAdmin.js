// backend/middleware/verifyAdmin.js
const User = require('../models/User');

async function verifyAdmin(req, res, next) {
    try {
        // Очікується, що verifyToken вже відпрацював і додав req.user
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Доступ заборонено. Потрібна автентифікація.' });
        }

        const user = await User.findById(req.user.id);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Доступ заборонено. У вас немає прав адміністратора.' });
        }

        // Якщо користувач є адміністратором, пропускаємо запит далі
        next();
    } catch (error) {
        res.status(500).json({ message: 'Внутрішня помилка сервера під час перевірки прав адміністратора.' });
    }
}

module.exports = verifyAdmin;