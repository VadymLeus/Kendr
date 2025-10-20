// backend/controllers/supportController.js
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');

exports.createTicket = async (req, res, next) => {
    try {
        const { subject, body } = req.body;
        if (!subject || !body) {
            return res.status(400).json({ message: 'Тема та текст звернення є обов\'язковими.' });
        }
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
        const currentUserId = req.user.id;

        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return res.status(401).json({ message: 'Помилка автентифікації: користувача не знайдено.' });
        }

        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Звернення не знайдено.' });
        }

        const isOwner = ticket.user_id === currentUserId;
        const isAdmin = currentUser.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'У вас немає доступу до цього звернення.' });
        }

        const replies = await SupportTicket.getReplies(ticketId);
        res.json({ ...ticket, replies });

    } catch (error) {
        console.error(`[SUPPORT_ERROR] Помилка при отриманні тікета #${req.params.ticketId}:`, error);
        next(error);
    }
};

exports.addReply = async (req, res, next) => {
    try {
        const { ticketId } = req.params;
        const { body } = req.body;
        const currentUserId = req.user.id;

        if (!body) {
            return res.status(400).json({ message: 'Текст відповіді не може бути порожнім.' });
        }

        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Звернення не знайдено.' });
        }
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return res.status(401).json({ message: 'Помилка автентифікації.' });
        }
        if (ticket.user_id !== currentUserId && currentUser.role !== 'admin') {
            return res.status(403).json({ message: 'Ви не можете відповідати на це звернення.' });
        }

        await SupportTicket.addReply(ticketId, currentUserId, body);
        res.status(201).json({ message: 'Відповідь успішно додано.' });
    } catch (error) {
        next(error);
    }
};

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
        if (!['open', 'answered', 'closed'].includes(status)) {
            return res.status(400).json({ message: 'Недійсний статус.' });
        }
        await SupportTicket.updateStatus(ticketId, status);
        res.json({ message: `Статус звернення #${ticketId} оновлено.` });
    } catch (error) { next(error); }
};