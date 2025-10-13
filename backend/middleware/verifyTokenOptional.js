// backend/middleware/verifyTokenOptional.js
const jwt = require('jsonwebtoken');

// Цей middleware схожий на verifyToken, але він не блокує запит, якщо токена немає.
// Він просто додає інформацію про користувача в req, якщо токен валідний.
function verifyTokenOptional(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        // Якщо токена немає, просто йдемо далі. req.user буде undefined.
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (!err) {
            // Якщо токен валідний, додаємо користувача до запиту
            req.user = user;
        }
        // Якщо токен невалідний, ми все одно йдемо далі, 
        // щоб не блокувати доступ до публічних даних.
        // req.user залишиться undefined.
        next();
    });
}

module.exports = verifyTokenOptional;