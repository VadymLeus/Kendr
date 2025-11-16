// backend/models/SupportTicket.js
const db = require('../db');

class SupportTicket {
    static async create(userId, subject, body) {
        const [result] = await db.query(
            'INSERT INTO support_tickets (user_id, subject, body) VALUES (?, ?, ?)',
            [userId, subject, body]
        );
        return { id: result.insertId, subject, body, status: 'open' };
    }

    static async findAllForUser(userId) {
        const [rows] = await db.query('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY updated_at DESC', [userId]);
        return rows;
    }

    static async findAllOpen() {
        const [rows] = await db.query(`
            SELECT st.*, u.username 
            FROM support_tickets st
            JOIN users u ON st.user_id = u.id
            WHERE st.status != 'closed' 
            ORDER BY st.updated_at ASC
        `);
        return rows;
    }

    static async findById(ticketId) {
        const [rows] = await db.query('SELECT * FROM support_tickets WHERE id = ?', [ticketId]);
        return rows[0];
    }

    static async addReply(ticketId, userId, body) {
        const [result] = await db.query(
            'INSERT INTO ticket_replies (ticket_id, user_id, body) VALUES (?, ?, ?)',
            [ticketId, userId, body]
        );
        const [userRows] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);
        const status = userRows[0].role === 'admin' ? 'answered' : 'open';

        await db.query('UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, ticketId]);
        
        return { id: result.insertId };
    }

    static async getReplies(ticketId) {
        const [rows] = await db.query(`
            SELECT tr.*, u.username, u.role, u.avatar_url
            FROM ticket_replies tr
            JOIN users u ON tr.user_id = u.id
            WHERE tr.ticket_id = ?
            ORDER BY tr.created_at ASC
        `, [ticketId]);
        return rows;
    }

    static async updateStatus(ticketId, status) {
        await db.query('UPDATE support_tickets SET status = ? WHERE id = ?', [status, ticketId]);
    }
}

module.exports = SupportTicket;