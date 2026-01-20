// backend/controllers/siteController.js
const Site = require('../models/Site');
const Page = require('../models/Page');
const UserTemplate = require('../models/UserTemplate');
const db = require('../config/db');
const fs = require('fs').promises;
const path = require('path');
const { deleteFile } = require('../utils/fileUtils');
const { v4: uuidv4 } = require('uuid');
const getDefaultLogoFiles = async () => {
    try {
        const defaultLogosDir = path.join(__dirname, '..', 'uploads', 'shops', 'logos', 'default');
        const files = await fs.readdir(defaultLogosDir);
        const validFiles = files.filter(f => !f.startsWith('.'));
        return validFiles.map(file => `/uploads/shops/logos/default/${file}`);
    } catch (e) {
        return ['/uploads/shops/logos/default/default-logo.webp'];
    }
};

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
        const { search, scope, tag, sort, onlyFavorites, userId } = req.query; 
        let targetUserId = null;
        let includeAllStatuses = false;
        if (scope === 'my' && req.user) {
            targetUserId = req.user.id;
            includeAllStatuses = true;
        }
        else if (userId) {
            targetUserId = userId;
            includeAllStatuses = false; 
        }

        const sites = await Site.getPublic({ 
            searchTerm: search, 
            userId: targetUserId, 
            tag, 
            sort,
            onlyFavorites: onlyFavorites === 'true',
            currentUserId: req.user ? req.user.id : null,
            includeAllStatuses: includeAllStatuses
        });
        res.json(sites);
    } catch (error) { next(error); }
};

exports.getTemplates = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT id, name, description, thumbnail_url, default_block_content FROM templates');
        const processedRows = rows.map(row => ({
            ...row,
            default_block_content: (typeof row.default_block_content === 'string') 
                ? JSON.parse(row.default_block_content) 
                : row.default_block_content
        }));
        res.json(processedRows);
    } catch (error) { next(error); }
};

exports.getDefaultLogos = async (req, res, next) => {
    try {
        const logoUrls = await getDefaultLogoFiles();
        res.json(logoUrls);
    } catch (error) { next(error); }
};

exports.createSite = async (req, res, next) => {
    const { templateId, sitePath, title, selected_logo_url, isPersonal } = req.body;
    const userId = req.user.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        if (!templateId || templateId === 'undefined') {
            throw new Error('ID шаблону не було надано.');
        }

        const [existing] = await connection.query('SELECT id FROM sites WHERE site_path = ?', [sitePath]);
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Ця адреса сайту вже зайнята.' });
        }
        let logoUrl = selected_logo_url;
        if (!logoUrl) {
            const defaults = await getDefaultLogoFiles();
            if (defaults && Array.isArray(defaults) && defaults.length > 0) {
                logoUrl = defaults[Math.floor(Math.random() * defaults.length)];
            }
        }
        if (!logoUrl || typeof logoUrl !== 'string') {
            logoUrl = '/uploads/shops/logos/default/default-logo.webp';
        }

        const relativeLogoUrl = logoUrl.replace(/^http:\/\/localhost:5000/, '');
        let templateData = {};
        let siteThemeConfig = {};

        if (isPersonal) {
            const [rows] = await connection.query('SELECT * FROM user_templates WHERE id = ? AND user_id = ?', [templateId, userId]);
            const personalTemplate = rows[0];
            if (!personalTemplate) {
                throw new Error('Шаблон не знайдено або у вас немає доступу.');
            }
            templateData = typeof personalTemplate.full_site_snapshot === 'string' 
                ? JSON.parse(personalTemplate.full_site_snapshot) 
                : personalTemplate.full_site_snapshot;

            siteThemeConfig = {
                theme_settings: templateData.theme_settings || {},
                header_content: regenerateBlockIds(templateData.header_content || []),
                site_theme_mode: templateData.site_theme_mode || 'light',
                site_theme_accent: templateData.site_theme_accent || 'blue'
            };
        } else {
            const [templates] = await connection.query('SELECT default_block_content FROM templates WHERE id = ?', [templateId]);
            if (!templates[0] || !templates[0].default_block_content) {
                throw new Error(`Шаблон з ID ${templateId} не знайдено.`);
            }
            const rawContent = templates[0].default_block_content;
            templateData = (typeof rawContent === 'string') ? JSON.parse(rawContent) : rawContent;
        }

        let pagesToCreate = templateData.pages || [];
        let footerToSave = regenerateBlockIds(templateData.footer_content || []);
        let headerToSave = regenerateBlockIds(templateData.header_content || []);
        if (!templateData.pages && Array.isArray(templateData)) {
            pagesToCreate = [{ title: 'Головна', slug: 'home', blocks: templateData }];
        }
        if (headerToSave.length > 0) {
            headerToSave = headerToSave.map(b => {
                if (b.type === 'header') {
                    return {
                        ...b,
                        data: {
                            ...b.data,
                            site_title: title,
                            logo_src: relativeLogoUrl,
                            show_title: true
                        }
                    };
                }
                return b;
            });
        } else {
            headerToSave = [{
                block_id: uuidv4(),
                type: 'header',
                data: {
                    site_title: title,
                    logo_src: relativeLogoUrl,
                    show_title: true,
                    nav_items: [{ id: uuidv4(), label: 'Головна', link: '/' }],
                    show_profile_icon: true,
                    show_cart_icon: true,
                    block_theme: 'auto'
                }
            }];
        }
        const [siteResult] = await connection.query(
            `INSERT INTO sites (user_id, site_path, title, logo_url, status) VALUES (?, ?, ?, ?, 'draft')`,
            [userId, sitePath, title, relativeLogoUrl]
        );
        const newSiteId = siteResult.insertId;
        const themeSettingsJson = JSON.stringify(siteThemeConfig.theme_settings || {});
        const headerContentJson = JSON.stringify(headerToSave);
        const footerContentJson = JSON.stringify(footerToSave);
        const themeMode = siteThemeConfig.site_theme_mode || 'light';
        const themeAccent = siteThemeConfig.site_theme_accent || 'orange';

        await connection.query(
            `UPDATE sites SET 
             header_content = ?, 
             footer_content = ?, 
             theme_settings = ?,
             site_theme_mode = ?,
             site_theme_accent = ?
             WHERE id = ?`,
            [headerContentJson, footerContentJson, themeSettingsJson, themeMode, themeAccent, newSiteId]
        );
        if (pagesToCreate.length > 0) {
            for (const pageData of pagesToCreate) {
                const pageBlocks = regenerateBlockIds(pageData.blocks || []);
                const pageSlug = pageData.slug || `page-${Date.now()}`;
                const pageName = pageData.title || 'Нова сторінка';
                const isHome = (pageSlug === 'home') ? 1 : 0;

                await connection.query(
                    `INSERT INTO pages (site_id, name, slug, block_content, is_homepage) VALUES (?, ?, ?, ?, ?)`,
                    [newSiteId, pageName, pageSlug, JSON.stringify(pageBlocks), isHome]
                );
            }
        } else {
            await connection.query(
                `INSERT INTO pages (site_id, name, slug, block_content, is_homepage) VALUES (?, ?, ?, ?, ?)`,
                [newSiteId, 'Головна', 'home', JSON.stringify([]), 1]
            );
        }
        await connection.commit();

        res.status(201).json({ 
            message: 'Сайт успішно створено!', 
            site: { id: newSiteId, site_path: sitePath } 
        });

    } catch (error) {
        await connection.rollback();
        console.error('Помилка при створенні сайту:', error.message);
        if (req.file) await deleteFile(req.file.path);
        
        res.status(500).json({ message: error.message || 'Не вдалося створити сайт.' });
    } finally {
        connection.release();
    }
};

exports.getSiteByPath = async (req, res, next) => {
    try {
        const { site_path, slug } = req.params;
        const site = await Site.findByPath(site_path);
        if (!site) return res.status(404).json({ message: 'Сайт не знайдено.' });

        if (site.status === 'suspended') {
            let isAdmin = false;
            if (req.user) {
                const [currentUser] = await db.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
                if (currentUser[0]?.role === 'admin') isAdmin = true;
            }
            const isOwner = req.user && req.user.id === site.user_id;
            if (!isAdmin && !isOwner) return res.status(403).json({ message: 'Цей сайт тимчасово заблоковано.' });
        }
        
        let page;
        if (slug) page = await Page.findBySiteIdAndSlug(site.id, slug);
        else page = await Page.findHomepageBySiteId(site.id);

        if (!page) {
            if (slug) return res.status(404).json({ message: `Сторінку "${slug}" не знайдено.`, site: site });
            return res.status(500).json({ message: 'Головну сторінку не налаштовано.', site: site });
        }

        const [tags] = await db.query(`SELECT t.id, t.name FROM tags t JOIN site_tags st ON t.id = st.tag_id WHERE st.site_id = ?`, [site.id]);
        res.json({ ...site, page_content: page.block_content, page_id: page.id, page: page, tags: tags });
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
            return res.status(403).json({ message: 'У вас немає прав.' });
        }

        const { 
            title, status, tags, site_theme_mode, site_theme_accent, theme_settings, 
            header_content, footer_content, favicon_url, site_title_seo, 
            cover_image, cover_layout, logo_url,
            cover_logo_size,
            cover_logo_radius,
            cover_title_size
        } = req.body;

        const safeParse = (data, fallback) => {
            if (!data) return fallback;
            if (typeof data === 'object') return data;
            try { return JSON.parse(data); } catch (e) { return fallback; }
        };

        let processingHeaderContent = safeParse(header_content, null);
        let currentHeaderContent = processingHeaderContent || safeParse(site.header_content, []);
        let finalLogoUrl = logo_url !== undefined ? logo_url : site.logo_url;
        let finalTitle = title !== undefined ? title : site.title;
        if (processingHeaderContent && Array.isArray(processingHeaderContent)) {
            const incomingHeaderBlock = processingHeaderContent.find(b => b.type === 'header');
            if (incomingHeaderBlock && incomingHeaderBlock.data) {
                if (incomingHeaderBlock.data.logo_src !== undefined) finalLogoUrl = incomingHeaderBlock.data.logo_src;
                if (incomingHeaderBlock.data.site_title !== undefined) finalTitle = incomingHeaderBlock.data.site_title;
            }
        }

        if (Array.isArray(currentHeaderContent)) {
            let headerFound = false;
            currentHeaderContent = currentHeaderContent.map(block => {
                if (block.type === 'header') {
                    headerFound = true;
                    return {
                        ...block,
                        data: {
                            ...block.data,
                            logo_src: finalLogoUrl,
                            site_title: finalTitle
                        }
                    };
                }
                return block;
            });

            if (!headerFound) {
                currentHeaderContent.push({
                    block_id: uuidv4(),
                    type: 'header',
                    data: {
                        site_title: finalTitle,
                        logo_src: finalLogoUrl,
                        show_title: true,
                        nav_items: [],
                        block_theme: 'auto'
                    }
                });
            }
        }

        const updateData = { 
            title: finalTitle,
            status: status !== undefined ? status : site.status,
            logo_url: finalLogoUrl,
            site_theme_mode: site_theme_mode !== undefined ? site_theme_mode : site.site_theme_mode,
            site_theme_accent: site_theme_accent !== undefined ? site_theme_accent : site.site_theme_accent,
            theme_settings: safeParse(theme_settings, site.theme_settings),
            header_content: currentHeaderContent,
            footer_content: safeParse(footer_content, site.footer_content),
            favicon_url: favicon_url !== undefined ? favicon_url : site.favicon_url,
            site_title_seo: site_title_seo !== undefined ? site_title_seo : site.site_title_seo,
            cover_image: cover_image !== undefined ? cover_image : site.cover_image,
            cover_layout: cover_layout !== undefined ? cover_layout : site.cover_layout,
            cover_logo_size: cover_logo_size !== undefined ? parseInt(cover_logo_size) : site.cover_logo_size,
            cover_logo_radius: cover_logo_radius !== undefined ? parseInt(cover_logo_radius) : site.cover_logo_radius,
            cover_title_size: cover_title_size !== undefined ? parseInt(cover_title_size) : site.cover_title_size
        };

        await Site.updateSettings(site.id, updateData);
        
        if (Array.isArray(tags)) {
            await Site.updateTags(site.id, tags);
        }

        res.json({ 
            message: 'Налаштування оновлено',
            updated: {
                logo_url: finalLogoUrl,
                title: finalTitle,
                header_content: currentHeaderContent
            }
        });
    } catch (error) {
        console.error('Помилка updateSiteSettings:', error);
        next(error);
    }
};

exports.renameSite = async (req, res, next) => { 
    try { 
        const { site_path: oldPath } = req.params; 
        const { newPath } = req.body; 
        const userId = req.user.id; 

        if (!newPath) return res.status(400).json({ message: 'Новий шлях (newPath) є обов\'язковим.' }); 

        const sanitizedNewPath = newPath.toLowerCase().replace(/[^a-z0-9-]/g, ''); 
        if (sanitizedNewPath.length < 3) return res.status(400).json({ message: 'Мінімум 3 символи для адреси.' }); 

        const existingSite = await Site.findByPath(sanitizedNewPath); 
        if (existingSite) return res.status(409).json({ message: 'Ця адреса вже зайнята. Спробуйте іншу.' }); 

        const currentSite = await Site.findByPath(oldPath); 
        if (!currentSite || currentSite.user_id !== userId) return res.status(404).json({ message: 'Сайт не знайдено або недостатньо прав.' }); 

        const [result] = await db.query('UPDATE sites SET site_path = ? WHERE site_path = ? AND user_id = ?', [sanitizedNewPath, oldPath, userId]); 
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Сайт не знайдено або недостатньо прав.' }); 

        res.status(200).json({ message: 'Адресу сайту успішно змінено.', newPath: sanitizedNewPath }); 
    } catch (error) { 
        console.error('Помилка при перейменуванні сайту:', error); 
        res.status(500).json({ message: 'Помилка сервера при зміні адреси.' }); 
    } 
};

exports.getMySuspendedSites = async (req, res, next) => { 
    try { 
        const sites = await Site.findSuspendedForUser(req.user.id); 
        res.json(sites); 
    } catch (error) { next(error); } 
};

exports.deleteSite = async (req, res, next) => { 
    try { 
        const { site_path } = req.params; 
        const userId = req.user.id; 
        const result = await Site.deleteByPathAndUserId(site_path, userId); 
        if (!result) return res.status(404).json({ message: 'Сайт не знайдено або у вас немає прав на його видалення.' }); 
        res.json({ message: 'Сайт успішно видалено.' }); 
    } catch (error) { next(error); } 
};

exports.resetSiteToTemplate = async (req, res, next) => { 
    const { siteId } = req.params; 
    const { templateId, isPersonal } = req.body; 
    const userId = req.user.id; 
    const connection = await db.getConnection(); 
    try { 
        const site = await Site.findByIdAndUserId(siteId, userId); 
        if (!site) return res.status(403).json({ message: 'Сайт не знайдено або у вас немає прав.' }); 
        
        let templateData = {}; 
        if (isPersonal) { 
            const personalTemplate = await UserTemplate.findById(templateId); 
            if (!personalTemplate || personalTemplate.user_id !== userId) throw new Error('Приватний шаблон не знайдено.'); 
            templateData = personalTemplate.full_site_snapshot; 
        } else { 
            const [templates] = await connection.query('SELECT default_block_content FROM templates WHERE id = ?', [templateId]); 
            if (!templates[0]) throw new Error('Системний шаблон не знайдено.'); 
            const rawContent = templates[0].default_block_content; 
            templateData = (typeof rawContent === 'string') ? JSON.parse(rawContent) : rawContent; 
        } 
        
        const headerToSave = regenerateBlockIds(templateData.header_content || []); 
        const footerToSave = regenerateBlockIds(templateData.footer_content || []); 
        let pagesToCreate = templateData.pages || []; 
        if (!templateData.pages && Array.isArray(templateData)) pagesToCreate = [{ title: 'Головна', slug: 'home', blocks: templateData }]; 
        
        await connection.beginTransaction(); 
        await connection.query('DELETE FROM pages WHERE site_id = ?', [siteId]); 
        
        const updateQuery = `UPDATE sites SET header_content = ?, footer_content = ?, site_theme_mode = ?, site_theme_accent = ?, theme_settings = ? WHERE id = ?`; 
        const themeSettings = templateData.theme_settings || {}; 
        const siteThemeMode = templateData.site_theme_mode || 'light'; 
        const siteThemeAccent = templateData.site_theme_accent || 'orange'; 
        await connection.query(updateQuery, [JSON.stringify(headerToSave), JSON.stringify(footerToSave), siteThemeMode, siteThemeAccent, JSON.stringify(themeSettings), siteId]); 
        
        for (const pageData of pagesToCreate) { 
            const blocks = regenerateBlockIds(pageData.blocks || pageData.block_content || []); 
            await connection.query('INSERT INTO pages (site_id, name, slug, block_content, is_homepage) VALUES (?, ?, ?, ?, ?)', [siteId, pageData.title || 'Нова сторінка', pageData.slug || `page-${uuidv4()}`, JSON.stringify(blocks), (pageData.slug === 'home' || pageData.is_homepage) ? 1 : 0]); 
        } 
        await connection.commit(); 
        res.json({ message: 'Сайт успішно скинуто до шаблону.' }); 
    } catch (error) { 
        await connection.rollback(); 
        console.error('Помилка при зміні шаблону:', error); 
        next(error); 
    } finally { connection.release(); } 
};

exports.getUserSites = async (req, res, next) => { 
    try { 
        const sites = await Site.getUserSites(req.user.id); 
        res.json(sites); 
    } catch (error) { next(error); } 
};

exports.toggleSitePin = async (req, res, next) => { 
    try { 
        const { siteId } = req.params; 
        const userId = req.user.id; 
        const site = await Site.findByIdAndUserId(siteId, userId); 
        if (!site) return res.status(404).json({ message: 'Сайт не знайдено або у вас немає прав.' }); 
        const newState = await Site.togglePin(siteId); 
        res.json({ message: newState ? 'Сайт закріплено' : 'Сайт відкріплено', is_pinned: newState }); 
    } catch (error) { next(error); } 
};

exports.checkSlug = async (req, res, next) => {
    try {
        const { slug } = req.query;
        if (!slug) return res.status(400).json({ message: 'Slug is required' });

        const sanitizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
        const reservedWords = ['admin', 'api', 'login', 'dashboard', 'settings', 'create'];
        if (reservedWords.includes(sanitizedSlug)) {
            return res.json({ isAvailable: false, message: 'Ця адреса зарезервована системою.' });
        }

        const existingSite = await Site.findByPath(sanitizedSlug);
        
        if (existingSite) {
            return res.json({ isAvailable: false, message: 'Ця адреса вже зайнята.' });
        }

        res.json({ isAvailable: true });
    } catch (error) {
        next(error);
    }
};