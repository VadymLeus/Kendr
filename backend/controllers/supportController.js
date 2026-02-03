// backend/controllers/supportController.js
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const db = require('../config/db'); 

exports.createTicket = async (req, res, next) => {
    const connection = await db.getConnection();
    try {
        const { subject, body, siteId } = req.body; 
        const userId = req.user.id;

        if (!subject || !body) {
            return res.status(400).json({ message: 'Тема та текст звернення є обов\'язковими.' });
        }

        let ticketType = 'general';
        if (siteId) {
            ticketType = 'appeal';
            const [existingAppeals] = await connection.query(
                'SELECT id FROM site_appeals WHERE site_id = ?', 
                [siteId]
            );
            if (existingAppeals.length > 0) {
                return res.status(400).json({ 
                    message: 'Для цього сайту вже подано апеляцію. Ви не можете створити нову.' 
                });
            }
        }

        await connection.beginTransaction();

        const [ticketResult] = await connection.query(
            'INSERT INTO support_tickets (user_id, subject, body, type, status) VALUES (?, ?, ?, ?, "open")',
            [userId, subject, body, ticketType]
        );
        const ticketId = ticketResult.insertId;
        if (siteId) {
            await connection.query(
                'INSERT INTO site_appeals (site_id, user_id, ticket_id, status, created_at) VALUES (?, ?, ?, "pending", NOW())',
                [siteId, userId, ticketId]
            );
        }

        await connection.commit();

        res.status(201).json({ 
            id: ticketId, 
            subject, 
            body, 
            status: 'open',
            type: ticketType,
            message: siteId ? 'Апеляцію подано успішно.' : 'Звернення створено.'
        });

    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
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
        if (!currentUser) return res.status(401).json({ message: 'Помилка автентифікації.' });
        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Звернення не знайдено.' });
        const isOwner = ticket.user_id === currentUserId;
        const isAdmin = currentUser.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Доступ заборонено.' });
        const replies = await SupportTicket.getReplies(ticketId);
        res.json({ ...ticket, replies });
    } catch (error) {
        next(error);
    }
};

exports.addReply = async (req, res, next) => {
    try {
        const { ticketId } = req.params;
        const { body } = req.body;
        const currentUserId = req.user.id;
        if (!body) return res.status(400).json({ message: 'Введіть текст відповіді.' });
        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Звернення не знайдено.' });
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) return res.status(401).json({ message: 'Користувач не знайдений.' });
        if (ticket.user_id !== currentUserId && currentUser.role !== 'admin') {
            return res.status(403).json({ message: 'Ви не можете відповідати тут.' });
        }

        if (currentUser.role !== 'admin') {
            const lastReplies = await SupportTicket.getLastReplies(ticketId, 2);
            if (lastReplies.length >= 2) {
                const isSpamming = lastReplies.every(reply => reply.user_id === currentUserId);
                
                if (isSpamming) {
                    return res.status(429).json({ 
                        message: 'Ви вже відправили два повідомлення поспіль. Будь ласка, дочекайтеся відповіді адміністратора.' 
                    });
                }
            }
        }

        await SupportTicket.addReply(ticketId, currentUserId, body);
        res.status(201).json({ message: 'Відповідь додано.' });
    } catch (error) {
        next(error);
    }
};

exports.getAdminTickets = async (req, res, next) => {
    try {
        const statusFilter = req.query.status || 'active';
        const tickets = await SupportTicket.findAll(statusFilter);
        res.json(tickets);
    } catch (error) { 
        next(error); 
    }
};

exports.updateTicketStatus = async (req, res, next) => {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;
        if (!['open', 'answered', 'closed'].includes(status)) {
            return res.status(400).json({ message: 'Невірний статус.' });
        }
        await SupportTicket.updateStatus(ticketId, status);
        res.json({ message: `Статус оновлено на ${status}.` });
    } catch (error) { 
        next(error); 
    }
};