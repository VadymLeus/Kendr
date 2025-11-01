// backend/utils/blockPresets.js
const { v4: uuidv4 } = require('uuid');

// Базові налаштування для блоків
const blockDefaults = {
    hero: {
        title: "Ласкаво просимо!",
        subtitle: "Змініть цей текст у налаштуваннях блоку.",
        buttonText: "Дізнатись більше",
        buttonLink: "#",
        imageUrl: "https://placehold.co/1200x500/EFEFEF/31343C?text=Ваше+Зображення+Тут"
    },
    text: {
        headerTitle: "Про нас",
        aboutText: "Це текстовий блок. Ви можете редагувати його вміст."
    },
    categories: {
        title: "Категорії товарів"
    },
    catalog_grid: {
        title: "Наші товари",
        category: 'all'
    },
    banner: {
        imageUrl: "https://placehold.co/1000x300/CCCCCC/777777?text=Рекламний+Банер",
        link: "#"
    },
    features: {
        title: "Наші переваги",
        items: [
            { icon: '🚀', text: 'Швидка доставка' },
            { icon: '🛡️', text: 'Гарантія якості' },
            { icon: '💬', text: 'Підтримка 24/7' }
        ]
    }
};

// Генерація блоків за типом пресету
function getDefaultBlocksForPreset(presetType, options = {}) {
    let blocksConfig = [];

    switch (presetType) {
        case 'shop':
            blocksConfig = [
                { type: 'hero', data: { ...blockDefaults.hero, title: options.siteTitle || blockDefaults.hero.title } },
                { type: 'categories', data: blockDefaults.categories },
                { type: 'catalog_grid', data: blockDefaults.catalog_grid },
                { type: 'features', data: blockDefaults.features },
            ];
            break;
        case 'simple-bio':
        default:
            blocksConfig = [
                { type: 'text', data: { ...blockDefaults.text, headerTitle: options.siteTitle || blockDefaults.text.headerTitle } },
            ];
            break;
    }

    // Додаємо унікальний ID і зливаємо налаштування
    return blocksConfig.map(block => ({
        ...block,
        block_id: uuidv4(),
        data: { ...(blockDefaults[block.type] || {}), ...(block.data || {}) }
    }));
}

module.exports = { getDefaultBlocksForPreset };