// frontend/src/components/editor/LayersTab.jsx
import React from 'react';
// import BlockStructureTree from '../BlockStructureTree';

const LayersTab = ({ blocks, siteData }) => {
    return (
        <div>
            <h3 style={{ color: 'var(--site-text-primary)', marginBottom: '1rem' }}>
                🗂️ Шари сторінки
            </h3>
            <p className="text-secondary" style={{ marginBottom: '1rem' }}>
                Тут відображається структура вашої сторінки.
            </p>
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                border: '1px dashed var(--site-border-color)',
                borderRadius: '8px',
                color: 'var(--site-text-secondary)'
            }}>
                (Заглушка для компонента "Шари")
            </div>
        </div>
    );
};

export default LayersTab;