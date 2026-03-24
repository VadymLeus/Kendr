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
    '/my-orders': 'Мої замовлення',
    '/rules': 'Правила платформи',
    '/admin-gate': 'Доступ адміністратора',
    '/admin': 'Адмін-панель',
    '/admin/dashboard': 'Дашборд',
    '/admin/sites': 'Усі сайти',
    '/admin/users': 'Користувачі',
    '/admin/reports': 'Скарги',
    '/admin/tickets': 'Тікети',
    '/admin/templates': 'Шаблони',
    '/admin/billing': 'Білінг та Транзакції',
    '/admin/control': 'Управління'
};

export const getTitleForPath = (pathname) => {
    const cleanPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
    if (STATIC_TITLES[cleanPath]) {
        return STATIC_TITLES[cleanPath];
    }
    if (cleanPath.startsWith('/profile/')) {
        return 'Профіль користувача';
    }
    if (cleanPath.startsWith('/support/ticket/')) {
        return 'Звернення';
    }
    if (cleanPath.startsWith('/site/')) {
        if (cleanPath.includes('/product/')) {
            return 'Товар';
        }
        return 'Сайт'; 
    }
    return null;
};