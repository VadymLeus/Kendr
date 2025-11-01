// backend/controllers/siteController.js
const Site = require('../models/Site');
const db = require('../db');
const fs = require('fs').promises;
const path = require('path');
const { deleteFile } = require('../utils/fileUtils');

// Отримання сайтів
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

// Отримання шаблонів сайтів
exports.getTemplates = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT id, name, description, thumbnail_url FROM templates');
        res.json(rows);
    } catch (error) {
        next(error);
    }
};

// Отримання стандартних логотипів
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

// Створення сайту
exports.createSite = async (req, res, next) => {
    const { templateId, sitePath, title, selected_logo_url } = req.body;
    const userId = req.user.id;

    try {
        // Перевірка, чи templateId взагалі прийшов
        if (!templateId || templateId === 'undefined') {
            throw new Error('ID шаблону не було надано. Помилка на стороні клієнта.');
        }

        const existingSite = await Site.findByPath(sitePath);
        if (existingSite) {
            return res.status(400).json({ message: 'Ця адреса сайту вже зайнята.' });
        }

        let logoUrl;
        if (req.file) logoUrl = req.file.path;
        else if (selected_logo_url) logoUrl = selected_logo_url;
        else logoUrl = '/uploads/shops/logos/default/default-logo.webp';

        // Отримуємо стартовий контент із шаблону
        const [templates] = await db.query('SELECT default_block_content FROM templates WHERE id = ?', [templateId]);
        
        if (!templates[0] || !templates[0].default_block_content) {
            throw new Error(`Шаблон з ID ${templateId} не знайдено або він не містить 'default_block_content'.`);
        }
        const initialPageContent = templates[0].default_block_content;

        // Створюємо сайт
        const newSite = await Site.create(userId, sitePath, title, logoUrl);
        
        // Створюємо для нього головну сторінку
        await db.query(
            'INSERT INTO pages (site_id, title, slug, page_content, is_homepage) VALUES (?, ?, ?, ?, ?)',
            [newSite.id, 'Головна', '/', JSON.stringify(initialPageContent), 1]
        );

        res.status(201).json({ message: 'Сайт успішно створено!', site: newSite });
    } catch (error) {
        console.error('Помилка при створенні сайту:', error.message);
        if (req.file) {
            await deleteFile(req.file.path);
        }
        res.status(500).json({ message: error.message || 'Не вдалося створити сайт.' });
    }
};

// Отримання сайту за шляхом
exports.getSiteByPath = async (req, res, next) => {
    try {
        const { increment_view } = req.query;
        const site = await Site.findByPath(req.params.site_path);
        if (!site) return res.status(404).json({ message: 'Сайт не знайдено.' });

        if (site.status === 'suspended') {
            let isAdmin = false;
            if (req.user) {
                const [currentUser] = await db.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
                if (currentUser[0]?.role === 'admin') isAdmin = true;
            }
            if (!isAdmin) return res.status(403).json({ message: 'Цей сайт тимчасово заблоковано адміністрацією.' });
        }

        if (increment_view === 'true') Site.incrementViewCount(site.id);
        res.json(site);
    } catch (error) {
        next(error);
    }
};

// Оновлення контенту сторінки
exports.updatePageContent = async (req, res, next) => {
    const { page_id } = req.params;
    const { page_content } = req.body;
    const userId = req.user.id;

    try {
        const [rows] = await db.query(
            'SELECT s.user_id FROM sites s JOIN pages p ON s.id = p.site_id WHERE p.id = ?',
            [page_id]
        );
        if (!rows[0] || rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'У вас немає прав на редагування цієї сторінки.' });
        }

        await db.query(
            'UPDATE pages SET page_content = ? WHERE id = ?',
            [JSON.stringify(page_content), page_id]
        );
        res.json({ message: 'Контент сторінки успішно оновлено.' });
    } catch (error) {
        next(error);
    }
};

// Оновлення налаштувань сайту
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

// Отримання заблокованих сайтів користувача
exports.getMySuspendedSites = async (req, res, next) => {
    try {
        const sites = await Site.findSuspendedForUser(req.user.id);
        res.json(sites);
    } catch (error) {
        next(error);
    }
};

// Видалення сайту
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