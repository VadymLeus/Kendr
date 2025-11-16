// frontend/src/features/editor/editorConfig.js
export const BLOCK_LIBRARY = [
    { type: 'hero', name: 'Обкладинка (Hero)', icon: '🖼️' },
    { type: 'text', name: 'Текстовий блок', icon: '📝' },
    { type: 'image', name: 'Зображення', icon: '🏞️' },
    { type: 'button', name: 'Кнопка', icon: '🔘' },

    { 
        type: 'layout', 
        name: 'Макет (Колонки)', 
        icon: '📐', 
        presets: [
            { preset: '50-50', name: '2 колонки (50/50)', columns: 2 },
            { preset: '75-25', name: '2 колонки (75/25)', columns: 2 },
        ]
    },

    { type: 'categories', name: 'Вітрина категорій', icon: '🗂️' },
    { type: 'catalog_grid', name: 'Сітка товарів', icon: '🛍️' },
    { type: 'features', name: 'Переваги', icon: '✅' },
    { type: 'form', name: 'Форма звʼязку', icon: '✉️' },
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
                content: 'Вставте сюди свій текст.',
                alignment: 'left',
                style: 'p'
            };

        case 'image':
            return { 
                imageUrl: 'https://placehold.co/1000x500/EFEFEF/31343C?text=Ваше+зображення',
                alt: 'Опис зображення',
                objectFit: 'cover',
                borderRadius: '0px',
                link: '',
                targetBlank: false
            };

        case 'button':
            return { 
                text: 'Натисніть тут',
                link: '#',
                styleType: 'primary',
                alignment: 'center',
                targetBlank: false
            };

        case 'layout':
            const columnCount = options.columns || 2;
            return { 
                direction: 'row',
                preset: options.preset || '50-50',
                columns: Array(columnCount).fill().map(() => [])
            };

        case 'categories':
            return { 
                columns: 3,
                items: [
                    { id: generateBlockId(), image: 'https://placehold.co/300x300/EFEFEF/31343C?text=Елемент+1', title: 'Елемент 1', link: '#' },
                    { id: generateBlockId(), image: 'https://placehold.co/300x300/EFEFEF/31343C?text=Елемент+2', title: 'Елемент 2', link: '#' },
                    { id: generateBlockId(), image: 'https://placehold.co/300x300/EFEFEF/31343C?text=Елемент+3', title: 'Елемент 3', link: '#' }
                ]
            };

        case 'catalog_grid':
            return { 
                title: 'Нова сітка товарів',
                mode: 'auto',
                category_id: 'all',
                selectedProductIds: [],
                excludedProductIds: []
            };

        case 'features':
            return { 
                title: 'Наші переваги',
                columns: 3,
                items: [
                    { id: generateBlockId(), icon: '🌟', title: 'Особливість 1', text: 'Короткий опис' },
                    { id: generateBlockId(), icon: '💡', title: 'Особливість 2', text: 'Короткий опис' }
                ]
            };

        case 'form':
            return {
                buttonText: 'Надіслати',
                successMessage: 'Дякуємо! Ваше повідомлення надіслано.',
                notifyEmail: ''
            };

        default:
            return {};
    }
};