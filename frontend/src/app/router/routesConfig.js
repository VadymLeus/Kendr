// frontend/src/app/router/routesConfig.js
export const STATIC_TITLES = {
    '/': 'Головна',
    '/login': 'Вхід',
    '/register': 'Реєстрація',
    '/catalog': 'Каталог сайтів',
    '/my-sites': 'Мої сайти',
    '/create-site': 'Створити сайт',
    '/media-library': 'Медіатека',
    '/settings': 'Налаштування',
    '/support': 'Підтримка',
    '/support/new-ticket': 'Нове звернення',
    '/support/my-tickets': 'Мої звернення',
    '/support/appeal': 'Оскарження',
    '/cart': 'Кошик',
    '/rules': 'Правила платформи',
    '/admin': 'Адмін-панель',
    '/admin/support': 'Підтримка (Адмін)'
};

export const getTitleForPath = (pathname) => {
    const cleanPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

    if (STATIC_TITLES[cleanPath]) {
        return STATIC_TITLES[cleanPath];
    }
    
    if (cleanPath.startsWith('/profile/')) {
        return 'Профіль користувача';
    }

    return null;
};