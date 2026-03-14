// backend/config/mediaLimits.js
const COMMON_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.ogg', '.ttf', '.otf', '.woff', '.woff2'];
const COMMON_MIME_TYPES = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/ogg',
    'font/ttf', 'font/otf', 'font/woff', 'font/woff2',
    'application/x-font-ttf', 'application/x-font-opentype', 'application/font-woff', 'application/font-woff2'
];

const PLAN_LIMITS = {
    FREE: {
        maxFiles: 50,
        maxFileSizeMB: 5,
        maxSites: 3,
        maxProducts: 50,
        maxCategories: 20,
        allowedExtensions: COMMON_EXTENSIONS,
        allowedMimeTypes: COMMON_MIME_TYPES,
        isUnlimited: false
    },
    PLUS: {
        maxFiles: 150,
        maxFileSizeMB: 15,
        maxSites: 8,
        maxProducts: 200,
        maxCategories: 100,
        allowedExtensions: COMMON_EXTENSIONS,
        allowedMimeTypes: COMMON_MIME_TYPES,
        isUnlimited: false
    }
};

const getLimitsForUser = (role, plan) => {
    if (role === 'admin') {
        return {
            maxFiles: 9999999,
            maxFileSizeMB: 1024,
            maxSites: 9999999,
            maxProducts: 9999999,
            maxCategories: 9999999,
            allowedExtensions: COMMON_EXTENSIONS,
            allowedMimeTypes: COMMON_MIME_TYPES,
            isUnlimited: true
        };
    }
    
    const userPlan = plan ? plan.toUpperCase() : 'FREE';
    return PLAN_LIMITS[userPlan] || PLAN_LIMITS['FREE'];
};

module.exports = {
    PLAN_LIMITS,
    getLimitsForUser
};