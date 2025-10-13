// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

// Усі маршрути в цьому файлі вимагають, щоб користувач був автентифікований та мав роль адміністратора.
router.use(verifyToken, verifyAdmin);

// GET /api/admin/sites -> Отримати список усіх сайтів
router.get('/sites', adminController.getAllSites);

// DELETE /api/admin/sites/:site_path -> Видалити сайт за його адресою
router.delete('/sites/:site_path', adminController.deleteSiteByAdmin);

module.exports = router;