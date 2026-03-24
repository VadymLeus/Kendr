// backend/middleware/verifyStrictAdmin.js
function verifyStrictAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Доступ заборонено. Ця дія дозволена лише головному адміністратору.' });
    }
}

module.exports = verifyStrictAdmin;