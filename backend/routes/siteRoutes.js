// backend/routes/siteRoutes.js
const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const verifyToken = require('../middleware/verifyToken');
const verifyTokenOptional = require('../middleware/verifyTokenOptional');
const { upload, processAndSaveLogo } = require('../middleware/upload');

// Маршрути для отримання загальної інформації
router.get('/catalog', verifyTokenOptional, siteController.getSites);
router.get('/templates', siteController.getTemplates);
router.get('/default-logos', siteController.getDefaultLogos);

// Маршрути для конкретного сайту
router.get('/:site_path', verifyTokenOptional, siteController.getSiteByPath);

// Маршрути, що потребують автентифікації
router.post(
    '/create',
    verifyToken,
    upload.single('logo'),
    processAndSaveLogo(64),
    siteController.createSite
);

router.put(
    '/:site_path/settings',
    verifyToken,
    siteController.updateSiteSettings
);

router.delete(
    '/:site_path',
    verifyToken,
    siteController.deleteSite
);

router.get(
    '/my-suspended',
    verifyToken,
    siteController.getMySuspendedSites
);

router.put(
    '/page/:page_id/content',
    verifyToken,
    siteController.updatePageContent
);

module.exports = router;