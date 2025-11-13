// frontend/src/components/blocks/ButtonBlock.jsx
import React from 'react';

const ButtonBlock = ({ blockData, isEditorPreview }) => {
    const { text, link } = blockData;
    
    const accent = isEditorPreview ? 'var(--platform-accent)' : 'var(--site-accent)';
    const accentText = isEditorPreview ? 'var(--platform-accent-text)' : 'var(--site-accent-text)';
    const accentHover = isEditorPreview ? 'var(--platform-accent-hover)' : 'var(--site-accent-hover)';

    const buttonStyle = {
        display: 'inline-block',
        padding: '12px 24px',
        backgroundColor: accent,
        color: accentText,
        textDecoration: 'none',
        borderRadius: '6px',
        border: 'none',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        textAlign: 'center'
    };

    const containerStyle = {
        padding: '20px',
        textAlign: 'center',
        background: isEditorPreview ? 'var(--platform-card-bg)' : 'transparent'
    };

    return (
        <div style={containerStyle}>
            <a 
                href={link || '#'} 
                style={buttonStyle}
                onMouseEnter={(e) => {
                    e.target.style.backgroundColor = accentHover;
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = accent;
                }}
            >
                {text || 'Кнопка'}
            </a>
        </div>
    );
};

export default ButtonBlock;