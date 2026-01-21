// backend/controllers/userTemplateController.js
const UserTemplate = require('../models/UserTemplate');
const Site = require('../models/Site');
const Page = require('../models/Page');
const db = require('../config/db');

exports.saveAsTemplate = async (req, res, next) => {
    try {
        const { siteId, templateName, description } = req.body;
        const userId = req.user.id;

        const site = await Site.findByIdAndUserId(siteId, userId);
        if (!site) {
            return res.status(403).json({ message: 'Сайт не знайдено або у вас немає прав.' });
        }

        const siteDetails = await Site.findByPath(site.site_path);
        const pages = await Page.findBySiteId(siteId);
        
        const pagesWithContent = await Promise.all(pages.map(async (p) => {
            const pageData = await Page.findById(p.id);
            return {
                title: pageData.name,
                slug: pageData.slug,
                blocks: pageData.block_content || [],
                is_homepage: pageData.is_homepage
            };
        }));

        const snapshot = {
            theme_settings: {
                ...(siteDetails.theme_settings || {}),
                mode: siteDetails.site_theme_mode || 'light',
                accent: siteDetails.site_theme_accent || 'blue'
            },
            header_content: siteDetails.header_content || [],
            footer_content: siteDetails.footer_content || [],
            pages: pagesWithContent
        };

        await UserTemplate.create(userId, templateName, description || '', snapshot);

        res.status(201).json({ message: 'Шаблон успішно створено!' });
    } catch (error) {
        next(error);
    }
};

exports.getMyTemplates = async (req, res, next) => {
    try {
        const [templates] = await db.query(
            'SELECT id, name, description, full_site_snapshot, created_at FROM user_templates WHERE user_id = ? ORDER BY created_at DESC', 
            [req.user.id]
        );

        const processedTemplates = templates.map(t => ({
            ...t,
            full_site_snapshot: (typeof t.full_site_snapshot === 'string') 
                ? JSON.parse(t.full_site_snapshot) 
                : t.full_site_snapshot
        }));

        res.json(processedTemplates);
    } catch (error) {
        next(error);
    }
};

exports.deleteTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [result] = await db.query(
            'DELETE FROM user_templates WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Шаблон не знайдено або у вас немає прав на його видалення.' });
        }
        
        res.json({ message: 'Шаблон успішно видалено.' });
    } catch (error) {
        next(error);
    }
};

exports.updateTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { siteId, templateName, description } = req.body;
        const userId = req.user.id;
        if (!siteId) {
            const [result] = await db.query(
                'UPDATE user_templates SET name = ?, description = ? WHERE id = ? AND user_id = ?',
                [templateName, description || '', id, userId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Шаблон не знайдено або у вас немає прав.' });
            }

            return res.json({ message: 'Інформацію про шаблон оновлено!' });
        }

        const site = await Site.findByIdAndUserId(siteId, userId);
        if (!site) return res.status(403).json({ message: 'Сайт для оновлення шаблону не знайдено.' });

        const siteDetails = await Site.findByPath(site.site_path);
        const pages = await Page.findBySiteId(siteId);
        
        const pagesWithContent = await Promise.all(pages.map(async (p) => {
            const pageData = await Page.findById(p.id);
            return {
                title: pageData.name,
                slug: pageData.slug,
                blocks: pageData.block_content || [],
                is_homepage: pageData.is_homepage
            };
        }));

        const snapshot = {
            theme_settings: {
                ...(siteDetails.theme_settings || {}),
                mode: siteDetails.site_theme_mode || 'light',
                accent: siteDetails.site_theme_accent || 'blue'
            },
            header_content: siteDetails.header_content || [],
            footer_content: siteDetails.footer_content || [],
            pages: pagesWithContent
        };

        const [result] = await db.query(
            'UPDATE user_templates SET name = ?, description = ?, full_site_snapshot = ? WHERE id = ? AND user_id = ?',
            [templateName, description || '', JSON.stringify(snapshot), id, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Шаблон не знайдено або у вас немає прав.' });
        }

        res.json({ message: 'Шаблон та його структуру успішно оновлено!' });
    } catch (error) {
        next(error);
    }
};