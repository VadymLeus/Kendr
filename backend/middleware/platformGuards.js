// backend/middleware/platformGuards.js
const db = require('../config/db');
let settingsCache = null;
let lastCacheTime = 0;
const CACHE_TTL = 30000;
const clearSettingsCache = () => {
    settingsCache = null;
    lastCacheTime = 0;
};

const getSettings = async () => {
    const now = Date.now();
    if (settingsCache && (now - lastCacheTime < CACHE_TTL)) {
        return settingsCache;
    }

    try {
        const [rows] = await db.query('SELECT * FROM platform_settings WHERE id = 1');
        if (rows.length > 0) {
            settingsCache = rows[0];
            lastCacheTime = now;
            return rows[0];
        }
    } catch (err) {
        console.error('Error fetching platform settings:', err);
    }
    
    return { is_platform_maintenance: 0, is_editor_locked: 0, global_announcement: null };
};

const checkMaintenance = async (req, res, next) => {
    if (req.path.startsWith('/api/auth') || req.path.startsWith('/auth')) {
        return next();
    }
    if (req.path.startsWith('/api/admin')) {
        return next();
    }

    const settings = await getSettings();
    let isAdmin = false;
    if (req.user) {
        if (req.user.role === 'admin') {
            isAdmin = true;
        }
    }
    const isLockedForUser = settings.is_editor_locked && !isAdmin;
    const isMaintenanceForUser = settings.is_platform_maintenance && !isAdmin;
    res.set('Access-Control-Expose-Headers', 'X-Editor-Locked, X-Maintenance-Mode, X-Global-Announcement');
    res.set('X-Editor-Locked', isLockedForUser ? 'true' : 'false');
    res.set('X-Maintenance-Mode', isMaintenanceForUser ? 'true' : 'false');
    if (settings.global_announcement) {
        const encodedAnnouncement = Buffer.from(settings.global_announcement).toString('base64');
        res.set('X-Global-Announcement', encodedAnnouncement);
    } else {
        res.set('X-Global-Announcement', '');
    }

    if (settings.is_platform_maintenance) {
        if (isAdmin) {
             req.platformSettings = settings;
             return next();
        }
        return res.status(503).json({
            message: "Платформа на технічному обслуговуванні. Ми скоро повернемося.",
            maintenance_mode: true,
            retry_after: 3600
        });
    }

    if (settings.is_editor_locked) {
        const isEditorRequest = 
            (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE' || req.method === 'PATCH') &&
            (req.path.startsWith('/api/sites') || req.path.startsWith('/api/pages') || req.path.startsWith('/api/media') || req.path.startsWith('/api/upload'));

        if (isEditorRequest) {
            if (isAdmin) return next();

            return res.status(503).json({
                message: "Редактор тимчасово заблоковано для оновлення.",
                editor_locked: true
            });
        }
    }

    req.platformSettings = settings;
    next();
};

module.exports = { checkMaintenance, clearSettingsCache };