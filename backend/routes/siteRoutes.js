// backend/routes/siteRoutes.js
const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const pageController = require('../controllers/pageController');
const verifyToken = require('../middleware/verifyToken');
const verifyTokenOptional = require('../middleware/verifyTokenOptional');
const { upload, processAndSaveLogo } = require('../middleware/upload');

router.get('/catalog', verifyTokenOptional, siteController.getSites);
router.get('/templates', siteController.getTemplates);
router.get('/default-logos', siteController.getDefaultLogos);

router.get('/:siteId/pages', verifyToken, pageController.getPagesForSite);
router.post('/:siteId/pages', verifyToken, pageController.createPage);

router.get('/:site_path', verifyTokenOptional, siteController.getSiteByPath);
router.get('/:site_path/:slug', verifyTokenOptional, siteController.getSiteByPath);

router.post('/create', verifyToken, upload.single('logo'), processAndSaveLogo(64), siteController.createSite);
router.put('/:site_path/settings', verifyToken, siteController.updateSiteSettings);
router.delete('/:site_path', verifyToken, siteController.deleteSite);
router.get('/my-suspended', verifyToken, siteController.getMySuspendedSites);

module.exports = router;