// frontend/src/templates/TemplateLoader.jsx
import React, { Suspense, lazy } from 'react';

// Динамічно імпортуємо всі компоненти шаблонів для ВІДОБРАЖЕННЯ
const TEMPLATE_COMPONENTS = {
    SimpleBioTemplate: lazy(() => import('./SimpleBio/SimpleBioTemplate')),
    ShopTemplate: lazy(() => import('./Shop/ShopTemplate')),
};

// Динамічно імпортуємо всі компоненти шаблонів для РЕДАГУВАННЯ
const EDIT_COMPONENTS = {
    // Видаляємо старі компоненти редагування, оскільки вони більше не використовуються
    // EditSitePage: lazy(() => import('./SimpleBio/EditSitePage')), // <-- ВИДАЛИТИ
    // EditShopPage: lazy(() => import('./Shop/EditShopPage')), // <-- ВИДАЛИТИ
};

// Цей компонент є обгорткою, яка вирішує, який шаблон завантажити
const TemplateLoader = ({ componentName, isEditMode = false, ...props }) => {
    // Якщо режим редагування, але компоненти редагування видалені - показуємо повідомлення
    if (isEditMode) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h3>Режим редагування</h3>
                <p>Функціонал редагування тепер доступний в панелі управління сайтом.</p>
                <p>Перейдіть до <strong>/dashboard/назва-сайту</strong> для редагування.</p>
            </div>
        );
    }

    const ComponentToRender = TEMPLATE_COMPONENTS[componentName];

    if (!ComponentToRender) {
        return <div>Помилка: Невідомий компонент шаблону '{componentName}'.</div>;
    }

    return (
        <Suspense fallback={<div>Завантаження шаблону...</div>}>
            <ComponentToRender {...props} />
        </Suspense>
    );
};

export default TemplateLoader;