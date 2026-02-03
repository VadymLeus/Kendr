// backend/routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

router.post('/', verifyToken, supportController.createTicket);
router.get('/my-tickets', verifyToken, supportController.getUserTickets);
router.get('/:ticketId', verifyToken, supportController.getTicketById);
router.post('/:ticketId/reply', verifyToken, supportController.addReply);
router.get('/admin/tickets', verifyToken, verifyAdmin, supportController.getAdminTickets);
router.put('/admin/:ticketId/status', verifyToken, verifyAdmin, supportController.updateTicketStatus);

module.exports = router;