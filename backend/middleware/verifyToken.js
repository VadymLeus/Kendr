// backend/middleware/verifyToken.js
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ message: 'Доступ заборонено. Токен не надано.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Недійсний токен.' });
        }
        // Додаємо payload токена (наприклад, { id: user.id }) до об'єкта запиту
        req.user = user; 
        next();
    });
}

module.exports = verifyToken;