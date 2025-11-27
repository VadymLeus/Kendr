/**
 * Перетворює прості шляхи (наприклад, /about) на повні шляхи сайту (/site/mysite/about).
 * Також ігнорує зовнішні посилання, якорі та спеціальні протоколи
 * * @param {string} link - Введене користувачем посилання
 * @param {string} sitePath - Шлях поточного сайту
 * @returns {string} - Оброблений URL
 */
export const resolveSiteLink = (link, sitePath) => {
    if (!link) return '#';
    
    if (link.startsWith('#') || 
        link.startsWith('http') || 
        link.startsWith('//') || 
        link.startsWith('mailto:') || 
        link.startsWith('tel:')) {
        return link;
    }

    if (link.startsWith('/site/')) {
        return link;
    }

    const cleanSlug = link.startsWith('/') ? link.substring(1) : link;

    if (!cleanSlug) {
        return `/site/${sitePath}`;
    }

    return `/site/${sitePath}/${cleanSlug}`;
};