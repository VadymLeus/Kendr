// backend/controllers/siteController.js
const Site = require('../models/Site');
const fs = require('fs').promises;
const path = require('path');

// Отримати список сайтів (всіх або лише користувача)
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

// Отримати список доступних шаблонів сайтів
exports.getTemplates = async (req, res, next) => {
    const templates = await Site.getTemplates();
    res.json(templates);
};

// Отримання списку стандартних логотипів
exports.getDefaultLogos = async (req, res, next) => {
    try {
        // Шлях до каталогу зі стандартними логотипами
        const defaultLogosDir = path.join(__dirname, '..', 'uploads', 'shops', 'logos', 'default');
        const files = await fs.readdir(defaultLogosDir);
        // Формуємо повні URL-адреси для кожного файлу
        const logoUrls = files.map(file => `/uploads/shops/logos/default/${file}`);
        res.json(logoUrls);
    } catch (error) {
        console.error("Помилка під час читання каталогу стандартних логотипів:", error);
        res.status(500).json({ message: "Не вдалося отримати стандартні логотипи." });
    }
};

// Створення нового сайту
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
            // Логотип за замовчуванням, якщо інший не було надано
            logoUrl = '/uploads/shops/logos/default/default-logo.webp';
        }

        const newSite = await Site.create(userId, templateId, sitePath, title, logoUrl);
        res.status(201).json({ message: 'Сайт успішно створено!', site: newSite });
    } catch (error) {
        // Якщо сталася помилка, видаляємо завантажений файл логотипа
        if (req.file) {
            const { deleteFile } = require('../utils/fileUtils');
            await deleteFile(req.file.path);
        }
        next(error);
    }
};

// Отримати дані сайту за його шляхом (site_path)
exports.getSiteByPath = async (req, res, next) => {
    const site = await Site.findByPath(req.params.site_path);
    if (!site) {
        return res.status(404).json({ message: 'Сайт не знайдено.' });
    }
    res.json(site);
};

// Оновити контент сайту (наприклад, заголовки, опис)
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

// Видалити сайт користувачем
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