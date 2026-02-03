// backend/routes/siteRoutes.js
const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const pageController = require('../controllers/pageController');
const verifyToken = require('../middleware/verifyToken');
const verifyTokenOptional = require('../middleware/verifyTokenOptional');
const trackVisit = require('../middleware/trackVisit');
const { upload, processAndSaveLogo } = require('../middleware/upload');

router.get('/check-slug', verifyToken, siteController.checkSlug);
router.get('/templates', siteController.getTemplates);
router.get('/catalog', verifyTokenOptional, siteController.getSites);
router.get('/default-logos', siteController.getDefaultLogos);
router.get('/my-suspended', verifyToken, siteController.getMySuspendedSites);
router.post('/create', verifyToken, upload.single('logo'), processAndSaveLogo(64), siteController.createSite);
router.put('/:siteId/reset-template', verifyToken, siteController.resetSiteToTemplate);
router.patch('/:siteId/pin', verifyToken, siteController.toggleSitePin);
router.get('/:siteId/pages', verifyToken, pageController.getPagesForSite);
router.post('/:siteId/pages', verifyToken, pageController.createPage);
router.put('/:site_path/rename', verifyToken, siteController.renameSite);
router.put('/:site_path/settings', verifyToken, siteController.updateSiteSettings);
router.delete('/:site_path', verifyToken, siteController.deleteSite);
router.get('/:site_path', trackVisit, verifyTokenOptional, siteController.getSiteByPath);
router.get('/:site_path/:slug', trackVisit, verifyTokenOptional, siteController.getSiteByPath);

module.exports = router;