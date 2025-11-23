// backend/controllers/siteController.js
const Site = require('../models/Site');
const Page = require('../models/Page');
const UserTemplate = require('../models/UserTemplate');
const db = require('../db');
const fs = require('fs').promises;
const path = require('path');
const { deleteFile } = require('../utils/fileUtils');
const { v4: uuidv4 } = require('uuid');

const regenerateBlockIds = (blocks) => {
    if (!blocks) return [];
    
    const mapBlock = (block) => {
        const newBlock = { ...block, block_id: uuidv4() };
        
        if (newBlock.data && newBlock.data.columns && Array.isArray(newBlock.data.columns)) {
            newBlock.data.columns = newBlock.data.columns.map(col => 
                col.map(child => mapBlock(child))
            );
        }
        if (newBlock.data && newBlock.data.items && Array.isArray(newBlock.data.items)) {
            newBlock.data.items = newBlock.data.items.map(item => ({...item, id: uuidv4()}));
        }
        
        return newBlock;
    };

    if (Array.isArray(blocks)) {
        return blocks.map(mapBlock);
    }
    return blocks;
};

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
    const { templateId, sitePath, title, selected_logo_url, isPersonal } = req.body;
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

        const relativeLogoUrl = logoUrl.replace(/^http:\/\/localhost:5000/, '');

        let templateData = {};
        let siteThemeConfig = {};

        if (isPersonal) {
            const personalTemplate = await UserTemplate.findById(templateId);
            if (!personalTemplate || personalTemplate.user_id !== userId) {
                throw new Error('Шаблон не знайдено або у вас немає доступу.');
            }
            templateData = personalTemplate.full_site_snapshot;
            
            siteThemeConfig = {
                theme_settings: templateData.theme_settings,
                header_content: regenerateBlockIds(templateData.header_content || []),
                site_theme_mode: templateData.site_theme_mode,
                site_theme_accent: templateData.site_theme_accent
            };
        } else {
            const [templates] = await db.query('SELECT default_block_content FROM templates WHERE id = ?', [templateId]);
            if (!templates[0] || !templates[0].default_block_content) {
                throw new Error(`Шаблон з ID ${templateId} не знайдено.`);
            }
            
            const rawContent = templates[0].default_block_content;
            templateData = (typeof rawContent === 'string') ? JSON.parse(rawContent) : rawContent;
        }

        let pagesToCreate = [];
        let footerToSave = [];
        let headerToSave = [];

        if (templateData.pages && Array.isArray(templateData.pages)) {
            pagesToCreate = templateData.pages;
            footerToSave = regenerateBlockIds(templateData.footer_content || []);
            headerToSave = regenerateBlockIds(templateData.header_content || []);
        } else if (Array.isArray(templateData)) {
            if (templateData.length > 0 && !templateData[0].slug) {
                pagesToCreate = [{
                    title: 'Головна',
                    slug: 'home',
                    blocks: templateData
                }];
            } else {
                pagesToCreate = templateData;
            }
        }

        if (headerToSave.length > 0) {
            const headerBlock = headerToSave.find(b => b.type === 'header');
            if (headerBlock) {
                headerBlock.data.site_title = title;
                headerBlock.data.logo_src = relativeLogoUrl;
                headerBlock.data.show_title = true;
            }
        } else {
            headerToSave = [{
                block_id: uuidv4(),
                type: 'header',
                data: {
                    site_title: title,
                    logo_src: relativeLogoUrl,
                    show_title: true,
                    nav_items: [
                         { id: uuidv4(), label: 'Головна', link: '/' }
                    ],
                    show_profile_icon: true,
                    show_cart_icon: true,
                    block_theme: 'auto'
                }
            }];
        }

        const newSite = await Site.create(userId, sitePath, title, logoUrl);

        await Site.updateSettings(newSite.id, {
            title: title,
            status: 'draft',
            footer_content: footerToSave,
            header_content: headerToSave,
            ...siteThemeConfig
        });

        if (pagesToCreate.length > 0) {
            for (const pageData of pagesToCreate) {
                await Page.create({
                    site_id: newSite.id,
                    name: pageData.title || 'Нова сторінка',
                    slug: pageData.slug || `page-${Date.now()}`,
                    block_content: regenerateBlockIds(pageData.blocks || []),
                    is_homepage: (pageData.slug === 'home') ? 1 : 0
                });
            }
        } else {
            await Page.create({
                site_id: newSite.id,
                name: 'Головна',
                slug: 'home',
                block_content: [],
                is_homepage: 1
            });
        }

        res.status(201).json({ message: 'Сайт успішно створено!', site: newSite });
    } catch (error) {
        console.error('Помилка при створенні сайту:', error.message);
        if (req.file) {
            await deleteFile(req.file.path);
        }
        res.status(500).json({ message: error.message || 'Не вдалося створити сайт.' });
    }
};

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
        const userId = req.user.id;

        const site = await Site.findByPath(site_path);
        if (!site || site.user_id !== userId) {
            return res.status(403).json({ message: 'У вас немає прав на редагування цього сайту.' });
        }

        const { 
            title, 
            status, 
            tags, 
            site_theme_mode, 
            site_theme_accent, 
            theme_settings, 
            header_content, 
            footer_content 
        } = req.body;

        const processJsonField = (newField, currentField) => {
            if (newField === undefined) return currentField;
            if (typeof newField === 'string') {
                try { return JSON.parse(newField); } 
                catch (e) { return currentField; }
            }
            return newField;
        };

        let finalHeaderContent = processJsonField(header_content, site.header_content);
        
        if (title && title !== site.title) {
            if (Array.isArray(finalHeaderContent)) {
                finalHeaderContent = finalHeaderContent.map(block => {
                    if (block.type === 'header') {
                        return {
                            ...block,
                            data: {
                                ...block.data,
                                site_title: title
                            }
                        };
                    }
                    return block;
                });
            }
        }

        await Site.updateSettings(site.id, { 
            title: title !== undefined ? title : site.title,
            status: status !== undefined ? status : site.status,
            
            site_theme_mode: site_theme_mode !== undefined ? site_theme_mode : site.site_theme_mode,
            site_theme_accent: site_theme_accent !== undefined ? site_theme_accent : site.site_theme_accent,
            
            theme_settings: processJsonField(theme_settings, site.theme_settings),
            header_content: finalHeaderContent,
            footer_content: processJsonField(footer_content, site.footer_content) 
        });
        
        if (Array.isArray(tags)) {
            await Site.updateTags(site.id, tags);
        }

        res.json({ message: 'Налаштування сайту успішно оновлено.' });
    } catch (error) {
        console.error('Помилка при оновленні налаштувань сайту:', error);
        next(error);
    }
};

exports.renameSite = async (req, res, next) => {
    try {
        const { site_path: oldPath } = req.params;
        const { newPath } = req.body;
        const userId = req.user.id;

        if (!newPath) {
            return res.status(400).json({ message: 'Новий шлях (newPath) є обов\'язковим.' });
        }

        const sanitizedNewPath = newPath.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (sanitizedNewPath.length < 3) {
            return res.status(400).json({ message: 'Мінімум 3 символи для адреси.' });
        }

        const existingSite = await Site.findByPath(sanitizedNewPath);
        if (existingSite) {
            return res.status(409).json({ message: 'Ця адреса вже зайнята. Спробуйте іншу.' });
        }

        const currentSite = await Site.findByPath(oldPath);
        if (!currentSite || currentSite.user_id !== userId) {
            return res.status(404).json({ message: 'Сайт не знайдено або недостатньо прав.' });
        }

        const [result] = await db.query(
            'UPDATE sites SET site_path = ? WHERE site_path = ? AND user_id = ?',
            [sanitizedNewPath, oldPath, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Сайт не знайдено або недостатньо прав.' });
        }

        res.status(200).json({ 
            message: 'Адресу сайту успішно змінено.', 
            newPath: sanitizedNewPath 
        });

    } catch (error) {
        console.error('Помилка при перейменуванні сайту:', error);
        res.status(500).json({ message: 'Помилка сервера при зміні адреси.' });
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