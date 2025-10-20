// backend/controllers/siteController.js
const Site = require('../models/Site');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

exports.getSites = async (req, res, next) => {
    const { search, scope } = req.query;
    let userId = null;

    if (scope === 'my') {
        if (!req.user) {
            return res.status(401).json({ message: 'Потрібна авторизація.' });
        }
        userId = req.user.id;
    }

    const sites = await Site.getPublic(search, userId);
    res.json(sites);
};

exports.getTemplates = async (req, res, next) => {
    const templates = await Site.getTemplates();
    res.json(templates);
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
        const existingSite = await Site.findByPath(sitePath);
        if (existingSite) {
            return res.status(400).json({ message: 'Ця адреса сайту вже зайнята.' });
        }
        
        let logoUrl;
        if (req.file) {
            logoUrl = req.file.path;
        } else if (selected_logo_url) {
            logoUrl = selected_logo_url;
        } else {
            logoUrl = '/uploads/shops/logos/default/default-logo.webp';
        }

        const newSite = await Site.create(userId, templateId, sitePath, title, logoUrl);
        res.status(201).json({ message: 'Сайт успішно створено!', site: newSite });
    } catch (error) {
        if (req.file) {
            const { deleteFile } = require('../utils/fileUtils');
            await deleteFile(req.file.path);
        }
        next(error);
    }
};

exports.getSiteByPath = async (req, res, next) => {
    try {
        const { increment_view } = req.query;
        const site = await Site.findByPath(req.params.site_path);
        
        if (!site) {
            return res.status(404).json({ message: 'Сайт не знайдено.' });
        }

        if (site.status === 'suspended') {
            let isAdmin = false;
            if (req.user) {
                const currentUser = await User.findById(req.user.id);
                if (currentUser && currentUser.role === 'admin') {
                    isAdmin = true;
                }
            }
            if (!isAdmin) {
                return res.status(403).json({ message: 'Цей сайт тимчасово заблоковано адміністрацією.' });
            }
        }

        if (increment_view === 'true') {
            Site.incrementViewCount(site.id);
        }

        res.json(site);
    } catch (error) {
        next(error);
    }
};

exports.updateSiteContent = async (req, res, next) => {
    const { site_path } = req.params;
    const { contentKey, contentValue } = req.body;
    const userId = req.user.id;

    const site = await Site.findByPath(site_path);
    if (!site) {
        return res.status(404).json({ message: 'Сайт не знайдено.' });
    }
    
    if (site.user_id !== userId) {
        return res.status(403).json({ message: 'У вас немає прав на редагування цього сайту.' });
    }
    
    await Site.updateContent(site.id, contentKey, contentValue);
    res.json({ message: 'Контент успішно оновлено.' });
};

exports.updateSiteSettings = async (req, res, next) => {
    try {
        const { site_path } = req.params;
        const { title, status, tags } = req.body;
        const userId = req.user.id;

        const site = await Site.findByPath(site_path);
        if (!site || site.user_id !== userId) {
            return res.status(403).json({ message: 'У вас немає прав на редагування цього сайту.' });
        }

        await Site.updateSettings(site.id, { title, status });
        
        if (Array.isArray(tags)) {
            await Site.updateTags(site.id, tags);
        }

        res.json({ message: 'Налаштування сайту успішно оновлено.' });
    } catch (error) {
        next(error);
    }
};

exports.deleteSite = async (req, res, next) => {
    try {
        const { site_path } = req.params;
        const userId = req.user.id;

        const result = await Site.deleteByPathAndUserId(site_path, userId);

        if (!result) {
            return res.status(404).json({ message: 'Сайт не знайдено або у вас немає прав на його видалення.' });
        }

        res.json({ message: 'Сайт та всі пов\'язані з ним дані було успішно видалено.' });
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