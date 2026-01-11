// frontend/src/shared/lib/utils/linkUtils.js

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