// frontend/src/templates/SimpleBio/SimpleBioTemplate.jsx
import React from 'react';

// Компонент-шаблон, який просто відображає передані дані
const SimpleBioTemplate = ({ content }) => {
    const headerTitle = content?.headerTitle || 'Заголовок за замовчуванням';
    const aboutText = content?.aboutText || 'Текст за замовчуванням...';

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: 'auto', padding: '20px' }}>
            <header style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                <h1>{headerTitle}</h1>
            </header>
            <main>
                <p style={{ lineHeight: '1.6' }}>
                    {aboutText}
                </p>
            </main>
        </div>
    );
};

export default SimpleBioTemplate;