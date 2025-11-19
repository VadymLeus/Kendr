// backend/routes/savedBlockRoutes.js
const express = require('express');
const router = express.Router();
const savedBlockController = require('../controllers/savedBlockController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);
router.get('/', savedBlockController.getSavedBlocks);
router.post('/', savedBlockController.saveBlock);
router.put('/:id', savedBlockController.updateSavedBlock);
router.delete('/:id', savedBlockController.deleteSavedBlock);

module.exports = router;