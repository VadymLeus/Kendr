// frontend/src/components/editor/SettingsTab.jsx
import React from 'react';

const SettingsTab = () => {
    return (
        <div style={{
            padding: '2rem',
            textAlign: 'center',
            border: '1px dashed var(--site-border-color)',
            borderRadius: '8px',
            color: 'var(--site-text-secondary)',
            marginTop: '2rem'
        }}>
            <span style={{ fontSize: '2rem' }}>⚙️</span>
            <p style={{ fontWeight: '500', color: 'var(--site-text-primary)' }}>
                Налаштування блоку
            </p>
            <p>
                Оберіть блок на сторінці, щоб побачити його налаштування.
            </p>
        </div>
    );
};

export default SettingsTab;