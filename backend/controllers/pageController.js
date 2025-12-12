// backend/controllers/pageController.js
const Page = require('../models/Page');
const Site = require('../models/Site');
const db = require('../config/db');

exports.getPagesForSite = async (req, res, next) => {
    try {
        const { siteId } = req.params;
        const userId = req.user.id;

        const site = await Site.findByIdAndUserId(siteId, userId);
        if (!site) {
            return res.status(403).json({ message: 'Доступ заборонено.' });
        }

        const pages = await Page.findBySiteId(siteId);
        res.json(pages);
    } catch (error) {
        next(error);
    }
};

exports.createPage = async (req, res, next) => {
    try {
        const { siteId } = req.params;
        const { name, slug } = req.body;
        const userId = req.user.id;

        if (!name || !slug) {
            return res.status(400).json({ message: 'Назва (name) та шлях (slug) є обов\'язковими.' });
        }

        const site = await Site.findByIdAndUserId(siteId, userId);
        if (!site) {
            return res.status(403).json({ message: 'Доступ заборонено.' });
        }

        const newPage = await Page.create({
            site_id: siteId,
            name,
            slug,
            block_content: [],
            is_homepage: 0
        });

        res.status(201).json(newPage);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Сторінка з таким slug вже існує на цьому сайті.' });
        }
        next(error);
    }
};

exports.getPageById = async (req, res, next) => {
    try {
        const { pageId } = req.params;
        const userId = req.user.id;

        const [rows] = await db.query(
            'SELECT s.user_id FROM sites s JOIN pages p ON s.id = p.site_id WHERE p.id = ?',
            [pageId]
        );
        if (!rows[0] || rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'У вас немає прав на редагування цієї сторінки.' });
        }

        const page = await Page.findById(pageId);
        if (!page) {
            return res.status(404).json({ message: 'Сторінку не знайдено.' });
        }
        res.json(page);
    } catch (error) {
        next(error);
    }
};

exports.updatePageContent = async (req, res, next) => {
    const { pageId } = req.params;
    const { block_content } = req.body;
    const userId = req.user.id;

    try {
        const [rows] = await db.query(
            'SELECT s.user_id FROM sites s JOIN pages p ON s.id = p.site_id WHERE p.id = ?',
            [pageId]
        );
        if (!rows[0] || rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'У вас немає прав на редагування цієї сторінки.' });
        }

        await Page.updateContent(pageId, block_content || []);
        res.json({ message: 'Контент сторінки успішно оновлено.' });
    } catch (error) {
        next(error);
    }
};

exports.updatePageSettings = async (req, res, next) => {
    try {
        const { pageId } = req.params;
        const { name, slug, seo_title, seo_description, seo_keywords } = req.body;
        const userId = req.user.id;

        if (!name || !slug) {
            return res.status(400).json({ message: 'Назва (name) та шлях (slug) є обов\'язковими.' });
        }
        
        const [rows] = await db.query(
            'SELECT s.user_id FROM sites s JOIN pages p ON s.id = p.site_id WHERE p.id = ?',
            [pageId]
        );
        if (!rows[0] || rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'Доступ заборонено.' });
        }

        await Page.updateSettings(pageId, { name, slug, seo_title, seo_description, seo_keywords });
        res.json({ message: 'Налаштування сторінки оновлено.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Сторінка з таким slug вже існує на цьому сайті.' });
        }
        next(error);
    }
};

exports.deletePage = async (req, res, next) => {
    try {
        const { pageId } = req.params;
        const userId = req.user.id;

        const [rows] = await db.query(
            'SELECT s.user_id, p.is_homepage, p.site_id FROM sites s JOIN pages p ON s.id = p.site_id WHERE p.id = ?',
            [pageId]
        );
        
        if (!rows[0] || rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'Доступ заборонено.' });
        }

        const { is_homepage, site_id } = rows[0];

        if (is_homepage) {
            return res.status(400).json({ message: 'Неможливо видалити головну сторінку.' });
        }

        const [countRows] = await db.query('SELECT COUNT(id) as count FROM pages WHERE site_id = ?', [site_id]);
        if (countRows[0].count <= 1) {
            return res.status(400).json({ message: 'Неможливо видалити останню сторінку сайту.' });
        }

        await Page.delete(pageId);
        res.json({ message: 'Сторінку успішно видалено.' });
    } catch (error) {
        next(error);
    }
};

exports.setHomePage = async (req, res, next) => {
    try {
        const { pageId } = req.params;
        const userId = req.user.id;

        const [rows] = await db.query(
            'SELECT s.user_id, p.site_id FROM sites s JOIN pages p ON s.id = p.site_id WHERE p.id = ?',
            [pageId]
        );

        if (!rows[0] || rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'Доступ заборонено.' });
        }

        const { site_id } = rows[0];
        await Page.setHomepage(site_id, pageId);
        res.json({ message: 'Головну сторінку оновлено.' });
    } catch (error) {
        next(error);
    }
};