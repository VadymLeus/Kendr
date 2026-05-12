// backend/routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.post('/:id/lock', teamController.heartbeat);
router.post('/:id/unlock', teamController.releaseLock);
router.post('/:id/invite', teamController.generateInvite);
router.get('/:id/invite', teamController.getActiveInvite);
router.delete('/:id/invite', teamController.deleteInvite);
router.post('/invite/accept', teamController.acceptInvite);
router.get('/:id/collaborators', teamController.getCollaborators);
router.delete('/:id/collaborators/:userId', teamController.removeCollaborator);
router.post('/:id/transfer/verify', teamController.verifyTransfer);
router.post('/:id/transfer', teamController.transferSite);

module.exports = router;