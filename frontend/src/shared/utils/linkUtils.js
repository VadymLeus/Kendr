// frontend/src/shared/utils/linkUtils.js
export const resolveSiteLink = (link, sitePath) => {
    if (!link || typeof link !== 'string') return '#';
    const trimmedLink = link.trim();
    if (/^(javascript|data|vbscript):/i.test(trimmedLink)) {
        console.warn('[SECURITY] Заблокирована попытка XSS через URI:', trimmedLink);
        return '#';
    }
    if (trimmedLink.startsWith('#') || 
        trimmedLink.startsWith('http://') || 
        trimmedLink.startsWith('https://') || 
        trimmedLink.startsWith('//') || 
        trimmedLink.startsWith('mailto:') || 
        trimmedLink.startsWith('tel:')) {
        return trimmedLink;
    }
    if (trimmedLink.startsWith('/site/')) {
        return trimmedLink;
    }
    const cleanSlug = trimmedLink.startsWith('/') ? trimmedLink.substring(1) : trimmedLink;
    if (!cleanSlug) {
        return `/site/${sitePath}`;
    }

    return `/site/${sitePath}/${cleanSlug}`;
};