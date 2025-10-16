// backend/controllers/supportController.js
const SupportTicket = require('../models/SupportTicket');

exports.createTicket = async (req, res, next) => {
    try {
        const { subject, body } = req.body;
        const ticket = await SupportTicket.create(req.user.id, subject, body);
        res.status(201).json(ticket);
    } catch (error) { next(error); }
};

exports.getUserTickets = async (req, res, next) => {
    try {
        const tickets = await SupportTicket.findAllForUser(req.user.id);
        res.json(tickets);
    } catch (error) { next(error); }
};

exports.getTicketById = async (req, res, next) => {
    try {
        const { ticketId } = req.params;
        const ticket = await SupportTicket.findById(ticketId);
        // Перевірка, чи користувач є власником тікета або адміном
        const user = req.user;
        const userRole = (await db.query('SELECT role FROM users WHERE id = ?', [user.id]))[0][0].role;

        if (ticket.user_id !== user.id && userRole !== 'admin') {
            return res.status(403).json({ message: 'Доступ заборонено.' });
        }
        
        const replies = await SupportTicket.getReplies(ticketId);
        res.json({ ...ticket, replies });
    } catch (error) { next(error); }
};

exports.addReply = async (req, res, next) => {
    try {
        const { ticketId } = req.params;
        const { body } = req.body;
        await SupportTicket.addReply(ticketId, req.user.id, body);
        res.status(201).json({ message: 'Відповідь додано.' });
    } catch (error) { next(error); }
};

// --- Admin ---
exports.getAllOpenTickets = async (req, res, next) => {
    try {
        const tickets = await SupportTicket.findAllOpen();
        res.json(tickets);
    } catch (error) { next(error); }
};

exports.updateTicketStatus = async (req, res, next) => {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;
        await SupportTicket.updateStatus(ticketId, status);
        res.json({ message: 'Статус оновлено.' });
    } catch (error) { next(error); }
};