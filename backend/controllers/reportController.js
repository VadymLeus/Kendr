// backend/controllers/reportController.js
const db = require('../config/db');

exports.createReport = async (req, res) => {
    try {
        const { site_id, reason, description } = req.body;
        
        if (!site_id || !reason) {
            return res.status(400).json({ message: 'Site ID and reason are required' });
        }

        const allowedReasons = ['spam', 'scam', 'inappropriate_content', 'copyright', 'other'];
        if (!allowedReasons.includes(reason)) {
            return res.status(400).json({ message: 'Invalid reason' });
        }

        const [sites] = await db.query('SELECT user_id FROM sites WHERE id = ?', [site_id]);
        
        if (sites.length === 0) {
            return res.status(404).json({ message: 'Site not found' });
        }

        const siteOwnerId = sites[0].user_id;
        const reporterId = req.user ? req.user.id : null;

        if (reporterId && siteOwnerId === reporterId) {
            return res.status(403).json({ message: 'Ви не можете скаржитись на власний сайт' });
        }

        const reporter_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const sql = `
            INSERT INTO site_reports (site_id, reporter_id, reporter_ip, reason, description)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        await db.query(sql, [site_id, reporterId, reporter_ip, reason, description]);

        res.status(201).json({ message: 'Report submitted successfully' });

    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({ message: 'Server error processing report' });
    }
};