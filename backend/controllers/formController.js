// backend/controllers/formController.js
const FormSubmission = require('../models/FormSubmission');
const Site = require('../models/Site');
const User = require('../models/User');
const { sendSubmissionNotification } = require('../utils/emailService');

exports.submitForm = async (req, res, next) => {
    try {
        const { siteId } = req.params;
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Ім\'я, Email та Повідомлення є обов\'язковими.' });
        }

        const submissionId = await FormSubmission.create(siteId, req.body);

        const [siteRows] = await require('../db').query(
            'SELECT user_id, title FROM sites WHERE id = ?', [siteId]
        );

        if (!siteRows[0]) {
            return res.status(404).json({ message: 'Сайт не знайдено.' });
        }

        const site = siteRows[0];
        const owner = await User.findById(site.user_id);

        if (owner && owner.email) {
            sendSubmissionNotification(owner.email, site.title, req.body);
        }

        res.status(201).json({ message: 'Заявку успішно надіслано.', id: submissionId });

    } catch (error) {
        next(error);
    }
};

exports.getSubmissions = async (req, res, next) => {
    try {
        const { siteId } = req.params;
        const site = await Site.findByIdAndUserId(siteId, req.user.id);

        if (!site) {
            return res.status(403).json({ message: 'Доступ заборонено.' });
        }

        const submissions = await FormSubmission.findBySiteId(siteId);
        res.json(submissions);
    } catch (error) {
        next(error);
    }
};

exports.markSubmissionRead = async (req, res, next) => {
    try {
        const { siteId, submissionId } = req.params;
        const site = await Site.findByIdAndUserId(siteId, req.user.id);

        if (!site) {
            return res.status(403).json({ message: 'Доступ заборонено.' });
        }

        await FormSubmission.markAsRead(submissionId, siteId);
        res.json({ message: 'Заявку позначено як прочитану.' });
    } catch (error) {
        next(error);
    }
};

exports.deleteSubmission = async (req, res, next) => {
    try {
        const { siteId, submissionId } = req.params;
        const site = await Site.findByIdAndUserId(siteId, req.user.id);

        if (!site) {
            return res.status(403).json({ message: 'Доступ заборонено.' });
        }

        await FormSubmission.deleteById(submissionId, siteId);
        res.json({ message: 'Заявку успішно видалено.' });
    } catch (error) {
        next(error);
    }
};