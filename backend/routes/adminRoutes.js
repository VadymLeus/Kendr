// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

router.use(verifyToken, verifyAdmin);

router.get('/sites', adminController.getAllSites);
router.delete('/sites/:site_path', adminController.deleteSiteByAdmin);
router.put('/sites/:site_path/status', adminController.updateSiteStatus);

module.exports = router;