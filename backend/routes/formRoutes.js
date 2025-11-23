// backend/routes/formRoutes.js
const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

router.get('/:siteId', formController.getSubmissions);
router.put('/:siteId/:submissionId/read', formController.markSubmissionRead);
router.patch('/:siteId/:submissionId/status', formController.updateStatus); // NEW
router.delete('/:siteId/:submissionId', formController.deleteSubmission);

module.exports = router;