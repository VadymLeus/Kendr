// frontend/src/components/editor/editorConfig.js
export const BLOCK_LIBRARY = [
    { type: 'hero', name: 'Обкладинка (Hero)', icon: '🖼️' },
    { type: 'text', name: 'Текстовий блок', icon: '📝' },
    { type: 'image', name: 'Зображення', icon: '🏞️' },
    { type: 'button', name: 'Кнопка', icon: '🔘' },
    { type: 'layout', name: 'Макет (Колонки)', icon: '📐', presets: [
        { preset: '100', name: '1 колонка (100%)', columns: 1 },
        { preset: '50-50', name: '2 колонки (50/50)', columns: 2 },
        { preset: '33-33-33', name: '3 колонки (33/33/33)', columns: 3 },
        { preset: '30-70', name: '2 колонки (30/70)', columns: 2 },
    ]},
    { type: 'categories', name: 'Сітка категорій', icon: '🗂️' },
    { type: 'catalog_grid', name: 'Сітка товарів', icon: '🛍️' },
    { type: 'features', name: 'Переваги', icon: '✅' },
];

export const generateBlockId = () => {
    if (crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const getDefaultBlockData = (type, options = {}) => {
    switch (type) {
        case 'hero':
            return { 
                title: 'Нова обкладинка', 
                subtitle: 'Тут буде ваш заголовок', 
                buttonText: 'Докладніше', 
                buttonLink: '#', 
                imageUrl: 'https://placehold.co/1200x500/EFEFEF/31343C?text=Нова+обкладинка' 
            };
        case 'text':
            return { 
                headerTitle: 'Новий текстовий блок', 
                aboutText: 'Вставте сюди свій текст.'
            };
        case 'image':
            return { 
                imageUrl: 'https://placehold.co/1000x500/EFEFEF/31343C?text=Ваше+зображення', 
                alt: 'Опис зображення' 
            };
        case 'button':
            return { 
                text: 'Натисніть тут', 
                link: '#' 
            };
        case 'layout':
            const columnCount = options.columns || 2;
            return { 
                preset: options.preset || '50-50', 
                columns: Array(columnCount).fill().map(() => []) 
            };
        case 'categories':
            return { title: 'Категорії товарів' };
        case 'catalog_grid':
            return { title: 'Нова сітка товарів', selectedProductIds: [] };
        case 'features':
            return { 
                title: 'Наші переваги', 
                items: [ 
                    { icon: '🌟', text: 'Особливість 1' }, 
                    { icon: '💡', text: 'Особливість 2' } 
                ] 
            };
        default:
            return {};
    }
};