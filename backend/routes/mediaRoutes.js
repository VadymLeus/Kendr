// backend/routes/mediaRoutes.js
const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const verifyToken = require('../middleware/verifyToken');
const { mediaUpload } = require('../middleware/upload');

router.use(verifyToken);

router.get('/', mediaController.getAll);

router.post(
    '/upload', 
    mediaUpload.single('mediaFile'),
    mediaController.upload
);

router.put('/:id', mediaController.updateMedia);

router.delete('/:id', mediaController.deleteMedia);

module.exports = router;