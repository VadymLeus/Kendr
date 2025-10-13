// frontend/src/templates/TemplateLoader.jsx
import React, { Suspense, lazy } from 'react';

// Динамічно імпортуємо всі компоненти шаблонів для ВІДОБРАЖЕННЯ
const TEMPLATE_COMPONENTS = {
    SimpleBioTemplate: lazy(() => import('./SimpleBio/SimpleBioTemplate')),
    ShopTemplate: lazy(() => import('./Shop/ShopTemplate')),
};

// Динамічно імпортуємо всі компоненти шаблонів для РЕДАГУВАННЯ
const EDIT_COMPONENTS = {
    EditSitePage: lazy(() => import('./SimpleBio/EditSitePage')),
    EditShopPage: lazy(() => import('./Shop/EditShopPage')),
};

// Цей компонент є обгорткою, яка вирішує, який шаблон завантажити
const TemplateLoader = ({ componentName, isEditMode = false, ...props }) => {
    const componentsMap = isEditMode ? EDIT_COMPONENTS : TEMPLATE_COMPONENTS;
    const ComponentToRender = componentsMap[componentName];

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