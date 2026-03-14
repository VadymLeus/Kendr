// backend/routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const { ticketUpload, processAndSaveTicketImages } = require('../middleware/upload');

router.post(
    '/', 
    verifyToken, 
    ticketUpload.array('attachments', 5), 
    processAndSaveTicketImages,
    supportController.createTicket
);
router.get('/my-tickets', verifyToken, supportController.getUserTickets);
router.get('/:ticketId', verifyToken, supportController.getTicketById);
router.post(
    '/:ticketId/reply', 
    verifyToken, 
    ticketUpload.array('attachments', 5), 
    processAndSaveTicketImages,
    supportController.addReply
);
router.get('/admin/tickets', verifyToken, verifyAdmin, supportController.getAdminTickets);
router.put('/:ticketId/status', verifyToken, supportController.updateTicketStatus);

module.exports = router;