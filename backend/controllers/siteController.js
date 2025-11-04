// backend/controllers/siteController.js
const Site = require('../models/Site');
const Page = require('../models/Page');
const db = require('../db');
const fs = require('fs').promises;
const path = require('path');
const { deleteFile } = require('../utils/fileUtils');

exports.getSites = async (req, res, next) => {
    try {
        const { search, scope } = req.query;
        let userId = null;
        if (scope === 'my') {
            if (!req.user) return res.status(401).json({ message: 'Потрібна авторизація.' });
            userId = req.user.id;
        }
        const sites = await Site.getPublic(search, userId);
        res.json(sites);
    } catch (error) {
        next(error);
    }
};

exports.getTemplates = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT id, name, description, thumbnail_url FROM templates');
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

exports.getDefaultLogos = async (req, res, next) => {
    try {
        const defaultLogosDir = path.join(__dirname, '..', 'uploads', 'shops', 'logos', 'default');
        const files = await fs.readdir(defaultLogosDir);
        const logoUrls = files.map(file => `/uploads/shops/logos/default/${file}`);
        res.json(logoUrls);
    } catch (error) {
        console.error("Помилка під час читання каталогу стандартних логотипів:", error);
        res.status(500).json({ message: "Не вдалося отримати стандартні логотипи." });
    }
};

exports.createSite = async (req, res, next) => {
    const { templateId, sitePath, title, selected_logo_url } = req.body;
    const userId = req.user.id;

    try {
        if (!templateId || templateId === 'undefined') {
            throw new Error('ID шаблону не було надано.');
        }

        const existingSite = await Site.findByPath(sitePath);
        if (existingSite) {
            return res.status(400).json({ message: 'Ця адреса сайту вже зайнята.' });
        }

        let logoUrl;
        if (req.file) logoUrl = req.file.path;
        else if (selected_logo_url) logoUrl = selected_logo_url;
        else logoUrl = '/uploads/shops/logos/default/default-logo.webp';

        const [templates] = await db.query('SELECT default_block_content FROM templates WHERE id = ?', [templateId]);
        
        if (!templates[0] || !templates[0].default_block_content) {
            throw new Error(`Шаблон з ID ${templateId} не знайдено або він не містить 'default_block_content'.`);
        }
        
        let initialBlockContent;
        try {
            initialBlockContent = JSON.parse(templates[0].default_block_content);
        } catch(e) {
            initialBlockContent = [];
        }

        const newSite = await Site.create(userId, sitePath, title, logoUrl);
        
        await Page.create({
            site_id: newSite.id, 
            name: 'Головна', 
            slug: 'home',
            block_content: initialBlockContent, 
            is_homepage: 1
        });

        res.status(201).json({ message: 'Сайт успішно створено!', site: newSite });
    } catch (error) {
        console.error('Помилка при створенні сайту:', error.message);
        if (req.file) {
            await deleteFile(req.file.path);
        }
        res.status(500).json({ message: error.message || 'Не вдалося створити сайт.' });
    }
};

// Оновлена версія для нових маршрутів
exports.getSiteByPath = async (req, res, next) => {
    try {
        const { site_path, slug } = req.params;
        const { increment_view } = req.query;

        const site = await Site.findByPath(site_path);
        if (!site) {
            return res.status(404).json({ message: 'Сайт не знайдено.' });
        }

        if (site.status === 'suspended') {
            let isAdmin = false;
            if (req.user) {
                const [currentUser] = await db.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
                if (currentUser[0]?.role === 'admin') isAdmin = true;
            }
            const isOwner = req.user && req.user.id === site.user_id;
            if (!isAdmin && !isOwner) {
                return res.status(403).json({ message: 'Цей сайт тимчасово заблоковано.' });
            }
        }
        
        let page;
        if (slug) {
            page = await Page.findBySiteIdAndSlug(site.id, slug);
        } else {
            page = await Page.findHomepageBySiteId(site.id);
        }

        if (!page) {
            if (slug) {
                return res.status(404).json({ 
                    message: `Сторінку "${slug}" не знайдено.`,
                    site: site
                });
            }
            
            return res.status(500).json({ 
                message: 'Головну сторінку для цього сайту не налаштовано. Зверніться до адміністратора.',
                site: site
            });
        }

        if (increment_view === 'true' && page.is_homepage && !req.user) {
            Site.incrementViewCount(site.id);
        }

        res.json({ 
            ...site, 
            page_content: page.block_content,
            page_id: page.id,
            page: page
        });

    } catch (error) {
        console.error('Помилка в getSiteByPath:', error);
        next(error);
    }
};

exports.updateSiteSettings = async (req, res, next) => {
    try {
        const { site_path } = req.params;
        const { title, status, tags, site_theme_mode, site_theme_accent } = req.body;
        const userId = req.user.id;

        const site = await Site.findByPath(site_path);
        if (!site || site.user_id !== userId) {
            return res.status(403).json({ message: 'У вас немає прав на редагування цього сайту.' });
        }

        await Site.updateSettings(site.id, { title, status, site_theme_mode, site_theme_accent });
        if (Array.isArray(tags)) await Site.updateTags(site.id, tags);

        res.json({ message: 'Налаштування сайту успішно оновлено.' });
    } catch (error) {
        next(error);
    }
};

exports.getMySuspendedSites = async (req, res, next) => {
    try {
        const sites = await Site.findSuspendedForUser(req.user.id);
        res.json(sites);
    } catch (error) {
        next(error);
    }
};

exports.deleteSite = async (req, res, next) => {
    try {
        const { site_path } = req.params;
        const userId = req.user.id;

        const result = await Site.deleteByPathAndUserId(site_path, userId);
        if (!result)
            return res.status(404).json({ message: 'Сайт не знайдено або у вас немає прав на його видалення.' });

        res.json({ message: 'Сайт успішно видалено.' });
    } catch (error) {
        next(error);
    }
};