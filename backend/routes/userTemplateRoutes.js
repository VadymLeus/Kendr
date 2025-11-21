// backend/routes/userTemplateRoutes.js
const express = require('express');
const router = express.Router();
const userTemplateController = require('../controllers/userTemplateController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.post('/', userTemplateController.saveAsTemplate);
router.put('/:id', userTemplateController.updateTemplate);
router.get('/', userTemplateController.getMyTemplates);
router.delete('/:id', userTemplateController.deleteTemplate);

module.exports = router;