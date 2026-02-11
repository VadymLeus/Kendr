// backend/controllers/adminController.js
const Site = require('../models/Site');
const User = require('../models/User');
const Warning = require('../models/Warning');
const db = require('../config/db');
const { deleteFile } = require('../utils/fileUtils');
const logAdminAction = require('../utils/adminLogger');
const { clearSettingsCache } = require('../middleware/platformGuards');

const deleteFullUserAccount = async (userId) => {
    const user = await User.findById(userId);
    if (user && user.avatar_url && user.avatar_url.includes('/avatars/custom/')) {
        await deleteFile(user.avatar_url);
    }

    const [sites] = await db.query('SELECT * FROM sites WHERE user_id = ?', [userId]);
    for (const site of sites) {
        if (site.logo_url && !site.logo_url.includes('/default/')) {
            await deleteFile(site.logo_url);
        }
        if (site.cover_image && !site.cover_image.includes('/default/')) {
            await deleteFile(site.cover_image);
        }
    }

    await User.deleteById(userId);
};

exports.getDashboardStats = async (req, res, next) => {
    try {
        const { period = 30, type = 'users' } = req.query;
        const days = parseInt(period) || 30;
        const [usersResult] = await db.query('SELECT COUNT(*) as count FROM users WHERE role != "admin"');
        const [usersGrowthResult] = await db.query('SELECT COUNT(*) as count FROM users WHERE role != "admin" AND created_at >= NOW() - INTERVAL 30 DAY');
        const [sitesResult] = await db.query('SELECT COUNT(*) as count FROM sites WHERE status = "published"');
        const [reportsResult] = await db.query('SELECT COUNT(*) as count FROM site_reports WHERE status = "new"');
        const [ticketsResult] = await db.query('SELECT COUNT(*) as count FROM support_tickets WHERE status = "open"');
        let tableName = 'users';
        let dateColumn = 'created_at';
        let whereCondition = '1=1'; 
        switch (type) {
            case 'sites':
                tableName = 'sites';
                whereCondition = '1=1'; 
                break;
            case 'tickets':
                tableName = 'support_tickets';
                break;
            case 'reports': 
                tableName = 'site_reports';
                break;
            case 'users':
            default:
                tableName = 'users';
                whereCondition = 'role != "admin"';
                break;
        }

        const chartQuery = `
            SELECT DATE_FORMAT(${dateColumn}, '%Y-%m-%d') as date, COUNT(*) as count
            FROM ${tableName}
            WHERE ${dateColumn} >= NOW() - INTERVAL ? DAY
            AND ${whereCondition}
            GROUP BY DATE_FORMAT(${dateColumn}, '%Y-%m-%d')
            ORDER BY date ASC
        `;
        
        const [chartRows] = await db.query(chartQuery, [days]);
        const chartData = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const shortDate = d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
            const found = chartRows.find(row => row.date === dateStr);
            chartData.push({
                date: dateStr,
                shortDate: shortDate,
                count: found ? found.count : 0
            });
        }
        const [lastUsers] = await db.query(`
            SELECT 
                u.id, 
                u.username as title, 
                u.created_at, 
                'user_register' as type,
                (SELECT COUNT(*) FROM user_warnings WHERE user_id = u.id) as status_info
            FROM users u
            WHERE u.role != "admin" 
            ORDER BY u.created_at DESC LIMIT 10
        `);

        const [lastSites] = await db.query(`
            SELECT s.id, s.title, s.created_at, s.status as status_info, 'site_create' as type
            FROM sites s ORDER BY created_at DESC LIMIT 10
        `);

        const [lastReports] = await db.query(`
            SELECT r.id, s.title as title, r.created_at, r.status as status_info, 'report' as type
            FROM site_reports r JOIN sites s ON r.site_id = s.id 
            ORDER BY r.created_at DESC LIMIT 10
        `);

        const [lastTickets] = await db.query(`
            SELECT id, subject as title, created_at, status as status_info, 'ticket' as type
            FROM support_tickets ORDER BY created_at DESC LIMIT 10
        `);

        const activityLog = [...lastUsers, ...lastSites, ...lastReports, ...lastTickets]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 20);
        res.json({
            stats: {
                users: usersResult[0]?.count || 0,
                usersGrowth: usersGrowthResult[0]?.count || 0,
                sites: sitesResult[0]?.count || 0,
                reports: reportsResult[0]?.count || 0,
                tickets: ticketsResult[0]?.count || 0
            },
            chartData,
            activityLog
        });

    } catch (error) {
        next(error);
    }
};

exports.getAdminLogs = async (req, res, next) => {
    try {
        const { admin_id, type } = req.query;
        let query = `
            SELECT l.*, 
                   u.username as admin_name, 
                   u.avatar_url as admin_avatar, 
                   u.email as admin_email
            FROM admin_logs l
            JOIN users u ON l.admin_id = u.id
            WHERE 1=1
        `;
        const params = [];
        if (admin_id) {
            query += ' AND l.admin_id = ?';
            params.push(admin_id);
        }
        if (type && type !== 'all') {
            query += ' AND l.action_type = ?';
            params.push(type);
        }
        query += ' ORDER BY l.created_at DESC LIMIT 100';
        const [logs] = await db.query(query, params);
        res.json(logs);
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const query = `
            SELECT 
                u.id, u.username, u.email, u.role, u.status, u.created_at, u.avatar_url,
                (SELECT COUNT(*) FROM sites WHERE user_id = u.id) as site_count,
                (SELECT COUNT(*) FROM user_warnings WHERE user_id = u.id) as warning_count
            FROM users u
            WHERE u.role != 'admin'
            ORDER BY u.created_at DESC
        `;
        const [users] = await db.query(query);
        res.json(users);
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'Ви не можете видалити свій власний акаунт з адмінки.' });
        }
        const [users] = await db.query('SELECT username, email FROM users WHERE id = ?', [id]);
        const userDetails = users[0] || {};
        await deleteFullUserAccount(id);
        await logAdminAction(req, 'user_delete', 'user', id, { 
            username: userDetails.username, 
            email: userDetails.email 
        });
        res.json({ message: 'Користувача та всі його дані успішно видалено.' });
    } catch (error) {
        next(error);
    }
};

exports.getAllSites = async (req, res, next) => {
    try {
        const query = `
            SELECT 
                s.id, s.site_path, s.title, s.status, s.user_id, s.created_at, s.deletion_scheduled_for,
                s.view_count,
                u.username as author, u.email as author_email,
                (SELECT COUNT(*) FROM user_warnings WHERE user_id = s.user_id) as warning_count,
                (SELECT status FROM site_appeals WHERE site_id = s.id ORDER BY created_at DESC LIMIT 1) as appeal_status,
                (SELECT created_at FROM site_appeals WHERE site_id = s.id ORDER BY created_at DESC LIMIT 1) as appeal_date
            FROM sites s
            JOIN users u ON s.user_id = u.id
            WHERE u.role != 'admin'
            ORDER BY s.created_at DESC
        `;
        const [sites] = await db.query(query);
        res.json(sites);
    } catch (error) {
        next(error);
    }
};

exports.suspendSite = async (req, res, next) => {
    try {
        const { site_path } = req.params;
        const [sites] = await db.query('SELECT * FROM sites WHERE site_path = ?', [site_path]);
        if (sites.length === 0) return res.status(404).json({ message: 'Сайт не знайдено' });
        const site = sites[0];
        const deletionDate = new Date();
        deletionDate.setDate(deletionDate.getDate() + 7);
        await Site.updateStatus(site.id, 'suspended', deletionDate);
        const [existingWarning] = await db.query(
            'SELECT id FROM user_warnings WHERE user_id = ? AND site_id = ?', 
            [site.user_id, site.id]
        );

        let strikeMessage = '';
        if (existingWarning.length === 0) {
            await Warning.create(site.user_id, site.id, `Сайт "${site.title}" заблоковано адміністратором. У вас є 7 днів на оскарження.`);
            strikeMessage = ' (Видано страйк).';
        } else {
            strikeMessage = ' (Страйк за цей сайт вже існує).';
        }

        await logAdminAction(req, 'site_suspend', 'site', site.id, { 
            title: site.title, 
            path: site.site_path 
        });

        const warningCount = await Warning.countForUser(site.user_id);
        if (warningCount >= 3) {
            await deleteFullUserAccount(site.user_id);
            return res.json({ 
                message: `Користувач отримав ${warningCount}-й страйк. Акаунт та всі сайти видалено автоматично.`,
                action: 'USER_DELETED' 
            });
        }

        res.json({ message: `Сайт призупинено.${strikeMessage} Включено таймер 7 днів.` });
    } catch (error) {
        next(error);
    }
};

exports.setProbation = async (req, res, next) => {
    try {
        const { site_path } = req.params;
        const [sites] = await db.query('SELECT * FROM sites WHERE site_path = ?', [site_path]);
        if (sites.length === 0) return res.status(404).json({ message: 'Сайт не знайдено' });
        const site = sites[0];
        await Site.updateStatus(site.id, 'probation', null);
        await logAdminAction(req, 'site_probation', 'site', site.id, { 
            title: site.title,
            path: site.site_path
        });

        res.json({ message: 'Сайт переведено на випробувальний термін. Таймер видалення зупинено.' });
    } catch (error) {
        next(error);
    }
};

exports.restoreSite = async (req, res, next) => {
    try {
        const { site_path } = req.params;
        const [sites] = await db.query('SELECT * FROM sites WHERE site_path = ?', [site_path]);
        if (sites.length === 0) return res.status(404).json({ message: 'Сайт не знайдено' });
        const site = sites[0];
        await Site.updateStatus(site.id, 'published', null);
        await db.query('UPDATE site_appeals SET status = "approved", resolved_at = NOW() WHERE site_id = ? AND status = "pending"', [site.id]);
        await db.query('DELETE FROM user_warnings WHERE site_id = ?', [site.id]);
        await logAdminAction(req, 'site_restore', 'site', site.id, { title: site.title });
        res.json({ message: 'Сайт успішно відновлено. Страйк анульовано.' });
    } catch (error) {
        next(error);
    }
};

exports.deleteSiteByAdmin = async (req, res, next) => {
    try {
        const { site_path } = req.params;
        const [sites] = await db.query('SELECT * FROM sites WHERE site_path = ?', [site_path]);
        if (sites.length === 0) return res.status(404).json({ message: 'Сайт не знайдено.' });
        const site = sites[0];
        await db.query('UPDATE site_appeals SET status = "rejected", resolved_at = NOW() WHERE site_id = ? AND status = "pending"', [site.id]);
        if (site.logo_url && !site.logo_url.includes('/default/')) {
            await deleteFile(site.logo_url);
        }
        if (site.cover_image && !site.cover_image.includes('/default/')) {
            await deleteFile(site.cover_image);
        }

        const [existingWarning] = await db.query(
            'SELECT id FROM user_warnings WHERE user_id = ? AND site_id = ?', 
            [site.user_id, site.id]
        );
        
        if (existingWarning.length === 0) {
            await Warning.create(site.user_id, site.id, `Сайт "${site.title}" был удален администратором из-за нарушений.`);
        }

        await Site.delete(site.id);
        await logAdminAction(req, 'site_delete', 'site', site.id, { 
            title: site.title, 
            path: site.site_path 
        });

        const warningCount = await Warning.countForUser(site.user_id);
        let userActionMessage = '';
        if (warningCount >= 3) {
            await deleteFullUserAccount(site.user_id);
            userActionMessage = ' Користувач отримав 3-й страйк і був ПОВНІСТЮ видалений.';
        }

        res.json({ message: `Сайт "${site.title}" остаточно видалено.${userActionMessage}` });
    } catch (error) {
        next(error);
    }
};

exports.getReports = async (req, res, next) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT r.*, s.title as site_title, s.site_path, u.email as reporter_email 
            FROM site_reports r
            LEFT JOIN sites s ON r.site_id = s.id
            LEFT JOIN users u ON r.reporter_id = u.id
        `;
        
        const params = [];
        if (status && status !== 'all') {
            query += ` WHERE r.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY r.created_at DESC`;

        const [reports] = await db.query(query, params);
        res.json(reports);
    } catch (error) {
        next(error);
    }
};

exports.dismissReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE site_reports SET status = "dismissed" WHERE id = ?', [id]);
        await logAdminAction(req, 'report_dismiss', 'report', id, { status: 'dismissed' });
        res.json({ message: 'Скаргу відхилено.' });
    } catch (error) {
        next(error);
    }
};

exports.reopenReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE site_reports SET status = "new" WHERE id = ?', [id]);
        await logAdminAction(req, 'report_reopen', 'report', id, { status: 'new' });
        res.json({ message: 'Скаргу повернуто до розгляду (статус New).' });
    } catch (error) {
        next(error);
    }
};

exports.banSiteFromReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [reports] = await db.query('SELECT * FROM site_reports WHERE id = ?', [id]);
        if (reports.length === 0) return res.status(404).json({ message: 'Скаргу не знайдено' });
        const report = reports[0];
        const [sites] = await db.query('SELECT * FROM sites WHERE id = ?', [report.site_id]);
        if (sites.length === 0) return res.status(404).json({ message: 'Сайт не знайдено' });
        const site = sites[0];
        await db.query('UPDATE site_reports SET status = "banned" WHERE id = ?', [id]);
        const deletionDate = new Date();
        deletionDate.setDate(deletionDate.getDate() + 7); 
        await Site.updateStatus(site.id, 'suspended', deletionDate);
        const [existingWarning] = await db.query(
            'SELECT id FROM user_warnings WHERE user_id = ? AND site_id = ?', 
            [site.user_id, site.id]
        );

        let strikeMessage = '';
        if (existingWarning.length === 0) {
            await Warning.create(site.user_id, site.id, `Сайт заблоковано через скаргу #${id}. Причина: ${report.reason}.`);
            strikeMessage = ' (Видано страйк).';
        } else {
            strikeMessage = ' (Страйк вже існував).';
        }

        await logAdminAction(req, 'report_ban', 'report', id, { 
            site_id: site.id,
            site_title: site.title,
            reason: report.reason 
        });

        const warningCount = await Warning.countForUser(site.user_id);
        if (warningCount >= 3) {
            await deleteFullUserAccount(site.user_id);
            return res.json({ 
                message: `Користувач отримав 3-й страйк. Акаунт та сайти видалено.`,
                action: 'USER_DELETED'
            });
        }

        res.json({ message: `Сайт заблоковано на 7 днів.${strikeMessage}` });
    } catch (error) {
        next(error);
    }
};

exports.getSystemTemplates = async (req, res, next) => {
    try {
        const query = "SELECT * FROM templates WHERE type = 'system' ORDER BY is_ready DESC, created_at DESC";
        const [templates] = await db.query(query);
        const processed = templates.map(t => ({
            ...t,
            default_block_content: (typeof t.default_block_content === 'string') ? JSON.parse(t.default_block_content) : t.default_block_content
        }));
        res.json(processed);
    } catch (error) { next(error); }
};

exports.createSystemTemplate = async (req, res, next) => {
    try {
        const { siteId, templateName, description, icon, category } = req.body;
        const adminId = req.user ? req.user.id : null;
        const [sites] = await db.query('SELECT * FROM sites WHERE id = ?', [siteId]);
        if (sites.length === 0) return res.status(404).json({ message: 'Сайт-джерело не знайдено' });
        const site = sites[0];
        const [pages] = await db.query('SELECT name, slug, block_content, is_homepage, seo_title, seo_description FROM pages WHERE site_id = ?', [siteId]);
        const templateContent = {
            theme_settings: typeof site.theme_settings === 'string' ? JSON.parse(site.theme_settings) : (site.theme_settings || {}),
            site_theme_mode: site.site_theme_mode,
            site_theme_accent: site.site_theme_accent,
            header_content: typeof site.header_content === 'string' ? JSON.parse(site.header_content) : (site.header_content || []),
            footer_content: typeof site.footer_content === 'string' ? JSON.parse(site.footer_content) : (site.footer_content || []),
            pages: pages.map(p => ({
                title: p.name,
                slug: p.slug,
                is_homepage: p.is_homepage,
                blocks: typeof p.block_content === 'string' ? JSON.parse(p.block_content) : p.block_content,
                seo_title: p.seo_title,
                seo_description: p.seo_description
            }))
        };
        const query = `INSERT INTO templates (user_id, name, description, thumbnail_url, default_block_content, type, is_ready, access_level, icon, category) VALUES (?, ?, ?, ?, ?, 'system', 0, 'admin_only', ?, ?)`;
        const thumbnail = site.cover_image || '/previews/empty.png';
        const [result] = await db.query(query, [
            adminId, 
            templateName, 
            description, 
            thumbnail, 
            JSON.stringify(templateContent),
            icon || 'Layout',
            category || 'General'
        ]);
        
        await logAdminAction(req, 'template_create', 'template', result.insertId || null, { name: templateName });
        res.status(201).json({ message: 'Системний шаблон створено (Статус: В розробці).' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Шаблон з такою назвою вже існує.' });
        next(error);
    }
};

exports.updateSystemTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, is_ready, access_level, icon, category } = req.body;
        if (access_level === 'public') {
            if (is_ready === false || is_ready === 0) return res.status(400).json({ message: 'Не можна опублікувати шаблон, який має статус "В розробці".' });
            if (is_ready === undefined) {
                 const [curr] = await db.query('SELECT is_ready FROM templates WHERE id = ?', [id]);
                 if (curr.length > 0 && !curr[0].is_ready) return res.status(400).json({ message: 'Не можна опублікувати шаблон, який ще не готовий.' });
            }
        }
        let finalAccessLevel = access_level;
        if (is_ready === false || is_ready === 0) finalAccessLevel = 'admin_only';
        let query = 'UPDATE templates SET ';
        const params = [];
        const updates = [];
        if (name) { updates.push('name = ?'); params.push(name); }
        if (description) { updates.push('description = ?'); params.push(description); }
        if (icon) { updates.push('icon = ?'); params.push(icon); }
        if (category) { updates.push('category = ?'); params.push(category); }
        if (is_ready !== undefined) { updates.push('is_ready = ?'); params.push(is_ready ? 1 : 0); }
        if (finalAccessLevel !== undefined) { updates.push('access_level = ?'); params.push(finalAccessLevel); }
        if (updates.length === 0) return res.json({ message: 'Немає даних для оновлення' });
        query += updates.join(', ') + ' WHERE id = ?';
        params.push(id);
        await db.query(query, params);
        await logAdminAction(req, 'template_update', 'template', id, { 
            name, 
            is_ready, 
            access_level: finalAccessLevel,
            category
        });

        res.json({ message: 'Шаблон оновлено.' });
    } catch (error) { next(error); }
};

exports.deleteSystemTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [tpl] = await db.query('SELECT name FROM templates WHERE id = ?', [id]);
        await db.query('DELETE FROM templates WHERE id = ?', [id]);
        await logAdminAction(req, 'template_delete', 'template', id, { 
            name: tpl[0]?.name 
        });

        res.json({ message: 'Системний шаблон видалено.' });
    } catch (error) { next(error); }
};

exports.getSystemSettings = async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT * FROM platform_settings WHERE id = 1');
        if (rows.length === 0) {
            return res.json({
                maintenance_mode: false,
                editor_locked: false,
                maintenance_message: '',
                registration_enabled: true
            });
        }

        const dbSettings = rows[0];
        res.json({
            maintenance_mode: !!dbSettings.is_platform_maintenance,
            editor_locked: !!dbSettings.is_editor_locked,
            maintenance_message: dbSettings.global_announcement || '',
            registration_enabled: true 
        });
    } catch (error) {
        next(error);
    }
};

exports.updateSystemSettings = async (req, res, next) => {
    try {
        const { maintenance_mode, editor_locked, maintenance_message, registration_enabled } = req.body;
        await db.query(`
            UPDATE platform_settings 
            SET is_platform_maintenance = ?, 
                is_editor_locked = ?, 
                global_announcement = ? 
            WHERE id = 1
        `, [
            maintenance_mode ? 1 : 0,
            editor_locked ? 1 : 0,
            maintenance_message || null
        ]);

        clearSettingsCache();
        await logAdminAction(req, 'settings_update', 'system', null, {
            maintenance: maintenance_mode,
            editor_lock: editor_locked,
            announcement: maintenance_message
        });
        if (maintenance_message) {
            res.set('X-Global-Announcement', Buffer.from(maintenance_message).toString('base64'));
        } else {
            res.set('X-Global-Announcement', '');
        }

        res.json({ 
            message: 'Налаштування платформи оновлено',
            settings: { 
                maintenance_mode, 
                editor_locked, 
                maintenance_message,
                registration_enabled
            } 
        });
    } catch (error) {
        next(error);
    }
};