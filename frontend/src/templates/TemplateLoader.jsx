// frontend/src/templates/TemplateLoader.jsx
import React, { Suspense, lazy } from 'react';

const TEMPLATE_COMPONENTS = {
    SimpleBioTemplate: lazy(() => import('./SimpleBio/SimpleBioTemplate')),
    ShopTemplate: lazy(() => import('./Shop/ShopTemplate')),
};

const EDIT_COMPONENTS = {
};

const TemplateLoader = ({ componentName, isEditMode = false, ...props }) => {
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