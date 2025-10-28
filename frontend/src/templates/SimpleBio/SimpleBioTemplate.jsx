// frontend/src/templates/SimpleBio/SimpleBioTemplate.jsx
import React from 'react';

const SimpleBioTemplate = ({ content }) => {
    const headerTitle = content?.headerTitle || 'Заголовок за замовчуванням';
    const aboutText = content?.aboutText || 'Текст за замовчуванням...';

    const containerStyle = {
        fontFamily: "'Inter', sans-serif",
        maxWidth: '800px',
        margin: 'auto',
        padding: '40px 20px',
        backgroundColor: 'var(--site-bg)',
        color: 'var(--site-text-primary)',
        minHeight: '100vh'
    };

    const headerStyle = {
        borderBottom: '2px solid var(--site-border-color)',
        paddingBottom: '15px',
        marginBottom: '30px'
    };
    
    const headingStyle = {
        color: 'var(--site-accent)',
        margin: 0,
        fontSize: '2.5rem',
        fontWeight: '700'
    };
     
    const paragraphStyle = {
        lineHeight: '1.7',
        color: 'var(--site-text-secondary)',
        fontSize: '1.1rem'
    };

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <h1 style={headingStyle}>{headerTitle}</h1>
            </header>
            <main>
                <p style={paragraphStyle}>
                    {aboutText}
                </p>
            </main>
        </div>
    );
};

export default SimpleBioTemplate;