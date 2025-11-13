// backend/routes/publicFormRoutes.js
const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

router.post('/:siteId/submit', formController.submitForm);

module.exports = router;