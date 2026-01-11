// frontend/src/modules/editor/core/editorConfig.jsx
import React from 'react';
import { 
    Image, FileText, MousePointerClick, Star, 
    Grid, ShoppingBag, List, Mail, 
    Video, MapPin, HelpCircle, Share2, 
    PanelTop, AlignLeft, AlignCenter, AlignRight 
} from 'lucide-react';

export const BLOCK_LIBRARY = [
    { type: 'hero', name: 'Обкладинка', icon: <Image size={20} /> },
    { type: 'text', name: 'Текстовий блок', icon: <FileText size={20} /> },
    { type: 'image', name: 'Зображення', icon: <Image size={20} /> },
    { type: 'button', name: 'Кнопка', icon: <MousePointerClick size={20} /> },
    { type: 'showcase', name: 'Вітрина', icon: <Star size={20} /> },
    { 
        type: 'layout', 
        name: 'Макет (Колонки)', 
        icon: <Grid size={20} />, 
        presets: [
            { preset: '50-50', name: '2 колонки (50/50)', columns: 2 },
            { preset: '75-25', name: '2 колонки (75/25)', columns: 2 },
            { preset: '33-33-33', name: '3 колонки (33/33/33)', columns: 3 },
            { preset: '25-25-25-25', name: '4 колонки (25/25/25/25)', columns: 4 },
        ]
    },
    { type: 'catalog', name: 'SPA Каталог', icon: <ShoppingBag size={20} /> },
    { type: 'features', name: 'Переваги', icon: <List size={20} /> },
    { type: 'form', name: 'Форма звʼязку', icon: <Mail size={20} /> },
    { type: 'video', name: 'Відео', icon: <Video size={20} /> },
    { type: 'map', name: 'Мапа', icon: <MapPin size={20} /> },
    { type: 'accordion', name: 'Акордеон', icon: <HelpCircle size={20} /> },
    { type: 'social_icons', name: 'Соцмережі', icon: <Share2 size={20} /> },
    { type: 'header', name: 'Глобальний Хедер', icon: <PanelTop size={20} />, isSystem: true },
];

export const generateBlockId = () => {
    if (crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const FONT_LIBRARY = [
    { label: 'Як на сайті (Default)', value: 'global', type: 'sans-serif' },
    
    { label: 'Inter', value: "'Inter', sans-serif", googleFont: 'Inter' },
    { label: 'Roboto', value: "'Roboto', sans-serif", googleFont: 'Roboto' },
    { label: 'Open Sans', value: "'Open Sans', sans-serif", googleFont: 'Open Sans' },
    { label: 'Montserrat', value: "'Montserrat', sans-serif", googleFont: 'Montserrat' },
    { label: 'Lato', value: "'Lato', sans-serif", googleFont: 'Lato' },
    { label: 'Nunito', value: "'Nunito', sans-serif", googleFont: 'Nunito' },
    { label: 'Oswald', value: "'Oswald', sans-serif", googleFont: 'Oswald' },
    { label: 'Raleway', value: "'Raleway', sans-serif", googleFont: 'Raleway' },

    { label: 'Merriweather', value: "'Merriweather', serif", googleFont: 'Merriweather' },
    { label: 'Playfair Display', value: "'Playfair Display', serif", googleFont: 'Playfair Display' },
    { label: 'Lora', value: "'Lora', serif", googleFont: 'Lora' },
    { label: 'PT Serif', value: "'PT Serif', serif", googleFont: 'PT Serif' },
    { label: 'Bitter', value: "'Bitter', serif", googleFont: 'Bitter' },

    { label: 'Comfortaa', value: "'Comfortaa', display", googleFont: 'Comfortaa' },
    { label: 'Russo One', value: "'Russo One', sans-serif", googleFont: 'Russo One' },
    { label: 'Pacifico', value: "'Pacifico', cursive", googleFont: 'Pacifico' },
    { label: 'Lobster', value: "'Lobster', cursive", googleFont: 'Lobster' },
    { label: 'Caveat', value: "'Caveat', cursive", googleFont: 'Caveat' },
    
    { label: 'Roboto Mono', value: "'Roboto Mono', monospace", googleFont: 'Roboto Mono' },
    { label: 'Ubuntu Mono', value: "'Ubuntu Mono', monospace", googleFont: 'Ubuntu Mono' }
];

export const getDefaultBlockData = (type, options = {}) => {
    switch (type) {
        case 'header':
            return {
                logo_src: '',
                site_title: 'Мій Сайт',
                show_title: true,
                logo_size: 'medium',
                nav_alignment: 'right',
                nav_style: 'text',
                nav_items: [
                    { id: generateBlockId(), label: 'Головна', link: '/' },
                    { id: generateBlockId(), label: 'Контакти', link: '/contacts' }
                ],
                block_theme: 'auto'
            };

        case 'hero':
            return { 
                bg_image: '',
                overlay_color: 'rgba(0, 0, 0, 0.5)',
                title: 'Заголовок обкладинки',
                subtitle: 'Напишіть тут короткий опис вашої пропозиції або компанії. Це перше, що побачать відвідувачі.',
                button_text: 'Дізнатись більше',
                button_link: '#',
                alignment: 'center',
                height: 'medium',
                fontFamily: 'global',
                block_theme: 'auto'
            };

        case 'text':
            return { 
                content: 'Вставте сюди свій текст.',
                alignment: 'left',
                style: 'p',
                fontFamily: 'global',
                block_theme: 'auto'
            };

        case 'image':
            return { 
                mode: 'single',
                items: [],
                width: 'medium',
                objectFit: 'contain',
                borderRadius: '0px',
                link: '',
                targetBlank: false,
                settings_slider: { 
                    navigation: true, 
                    pagination: true, 
                    autoplay: false, 
                    loop: true 
                },
                settings_grid: { columns: 3 },
                block_theme: 'auto'
            };

        case 'button':
            return { 
                text: 'Натисніть тут',
                link: '#',
                styleType: 'primary',
                alignment: 'center',
                targetBlank: false,
                block_theme: 'auto'
            };

        case 'layout':
            const columnCount = options.columns || 2;
            return { 
                preset: options.preset || '50-50',
                columns: Array(columnCount).fill().map(() => []),
                verticalAlign: 'top',
                direction: 'row',
                block_theme: 'auto'
            };

        case 'showcase':
            return {
                title: 'Хіти продажів',
                source_type: 'category',
                category_id: 'all',
                selected_product_ids: [],
                columns: 4,
                limit: 8,
                block_theme: 'auto'
            };

        case 'catalog':
            return { 
                title: 'Каталог товарів',
                source_type: 'all',
                root_category_id: null,
                show_search: true,
                show_category_filter: true,
                show_sorting: true,
                items_per_page: 12,
                columns: 3,
                block_theme: 'auto'
            };

        case 'features':
            return { 
                title: 'Наші переваги',
                columns: 2,
                items: [
                    { id: generateBlockId(), icon: 'star', title: 'Особливість 1', text: 'Короткий опис' },
                    { id: generateBlockId(), icon: 'zap', title: 'Особливість 2', text: 'Короткий опис' }
                ],
                block_theme: 'auto'
            };

        case 'form':
            return {
                buttonText: 'Надіслати',
                successMessage: 'Дякуємо! Ваше повідомлення надіслано.',
                notifyEmail: '',
                block_theme: 'auto'
            };

        case 'video':
            return {
                url: '',
                sizePreset: 'medium',
                block_theme: 'auto'
            };

        case 'map':
            return {
                embed_code: '',
                sizePreset: 'medium',
                block_theme: 'auto'
            };

        case 'accordion':
            return {
                fontFamily: 'global',
                items: [
                    { id: generateBlockId(), title: "Перше питання", content: "Текст відповіді тут..." },
                    { id: generateBlockId(), title: "Друге питання", content: "Інший текст відповіді..." }
                ],
                block_theme: 'auto'
            };

        case 'social_icons':
            return {
                alignment: 'left',
                facebook: '',
                instagram: '',
                telegram: '',
                youtube: '',
                tiktok: '',
                block_theme: 'auto'
            };

        default:
            return { block_theme: 'auto' };
    }
};

export const BLOCK_THEME_OPTIONS = [
    { value: 'auto', label: 'Автоматично (як на сайті)' },
    { value: 'light', label: 'Світла тема' },
    { value: 'dark', label: 'Темна тема' }
];

export const getBlockThemeClass = (blockTheme) => {
    if (blockTheme === 'light') return 'block-theme-light';
    if (blockTheme === 'dark') return 'block-theme-dark';
    return '';
};

export const ALIGNMENT_OPTIONS = [
    { value: 'left', label: 'Ліворуч', icon: <AlignLeft size={16} /> },
    { value: 'center', label: 'По центру', icon: <AlignCenter size={16} /> },
    { value: 'right', label: 'Праворуч', icon: <AlignRight size={16} /> }
];

export const HEIGHT_OPTIONS = [
    { value: 'small', label: 'Мала' },
    { value: 'medium', label: 'Середня' },
    { value: 'large', label: 'Велика' },
    { value: 'fullscreen', label: 'На весь екран' }
];

export const getDraggableBlocks = () => {
    return BLOCK_LIBRARY.filter(block => !block.isSystem);
};