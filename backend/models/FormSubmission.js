// backend/models/FormSubmission.js
const db = require('../db');

class FormSubmission {
    static async create(siteId, formData) {
        const [result] = await db.query(
            'INSERT INTO form_submissions (site_id, form_data) VALUES (?, ?)',
            [siteId, JSON.stringify(formData)]
        );
        return result.insertId;
    }

    static async findBySiteId(siteId) {
        const [rows] = await db.query(
            'SELECT * FROM form_submissions WHERE site_id = ? ORDER BY created_at DESC',
            [siteId]
        );
        return rows;
    }

    static async markAsRead(submissionId, siteId) {
        const [result] = await db.query(
            'UPDATE form_submissions SET is_read = 1 WHERE id = ? AND site_id = ?',
            [submissionId, siteId]
        );
        return result;
    }

    static async deleteById(submissionId, siteId) {
        const [result] = await db.query(
            'DELETE FROM form_submissions WHERE id = ? AND site_id = ?',
            [submissionId, siteId]
        );
        return result;
    }
}
module.exports = FormSubmission;