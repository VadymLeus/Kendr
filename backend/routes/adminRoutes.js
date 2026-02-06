// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

router.use(verifyToken, verifyAdmin);
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/sites', adminController.getAllSites);
router.delete('/sites/:site_path', adminController.deleteSiteByAdmin);
router.post('/sites/:site_path/suspend', adminController.suspendSite);
router.post('/sites/:site_path/restore', adminController.restoreSite);
router.post('/sites/:site_path/probation', adminController.setProbation);
router.get('/reports', adminController.getReports);
router.put('/reports/:id/dismiss', adminController.dismissReport);
router.put('/reports/:id/reopen', adminController.reopenReport);
router.post('/reports/:id/ban', adminController.banSiteFromReport);
router.get('/templates', adminController.getSystemTemplates);
router.post('/templates', adminController.createSystemTemplate);
router.put('/templates/:id', adminController.updateSystemTemplate);
router.delete('/templates/:id', adminController.deleteSystemTemplate);
router.get('/logs', adminController.getAdminLogs);

module.exports = router;