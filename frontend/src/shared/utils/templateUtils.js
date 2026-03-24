// frontend/src/shared/lib/utils/templateUtils.js
import { Layout, FileText, ShoppingBag, Briefcase, Camera, Coffee, Music, Star, Heart, Globe } from 'lucide-react';

export const ICON_MAP = {
    'Layout': Layout, 'FileText': FileText, 'ShoppingBag': ShoppingBag,
    'Briefcase': Briefcase, 'Camera': Camera, 'Coffee': Coffee,
    'Music': Music, 'Star': Star, 'Heart': Heart, 'Globe': Globe,
};

export const TEMPLATE_CATEGORIES = [
    { id: 'All', label: 'Всі' },
    { id: 'General', label: 'Загальне' },
    { id: 'Business', label: 'Бізнес' },
    { id: 'Store', label: 'Магазин' },
    { id: 'Portfolio', label: 'Портфоліо' },
    { id: 'Landing', label: 'Лендінг' },
    { id: 'Blog', label: 'Блог' },
    { id: 'Creative', label: 'Креатив' },
];

export const getTemplateIcon = (iconName) => ICON_MAP[iconName] || Layout;
export const getCategoryLabel = (catId) => {
    if (!catId) return null;
    const found = TEMPLATE_CATEGORIES.find(c => c.id.toLowerCase() === catId.toLowerCase());
    return found ? found.label : catId;
};

export const getTemplatePreviewData = (template) => {
    if (!template) return null;
    try {
        const content = typeof template.default_block_content === 'string' 
            ? JSON.parse(template.default_block_content) 
            : template.default_block_content;
        
        const themeSettings = content.theme_settings || {};
        return {
            siteData: { title: template.name },
            theme: { 
                ...themeSettings, 
                mode: content.site_theme_mode || themeSettings.mode || 'light', 
                accent: content.site_theme_accent || themeSettings.accent || 'orange' 
            },
            header: content.header_content || [], 
            footer: content.footer_content || [],
            pages: Array.isArray(content.pages) ? content.pages : [{ slug: 'home', blocks: content.blocks || [] }]
        };
    } catch (e) { 
        return null; 
    }
};