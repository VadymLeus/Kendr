// backend/routes/tagRoutes.js
const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

router.get('/', tagController.getAllTags);

router.get('/site/:siteId', tagController.getTagsForSite);

module.exports = router;