// backend/middleware/verifyToken.js
const jwt = require('jsonwebtoken');
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.status(401).json({ message: 'Доступ заборонено. Токен не надано.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Недійсний токен. Будь ласка, увійдіть знову.' });
        }
        req.user = user; 
        next();
    });
}

module.exports = verifyToken;