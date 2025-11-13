// frontend/src/components/blocks/ButtonBlock.jsx
import React from 'react';

const ButtonBlock = ({ blockData, isEditorPreview }) => {
    const { text, link, styleType, alignment, targetBlank } = blockData;

    const themeClass = styleType === 'secondary' ? 'btn-site-secondary' : 'btn-site-primary';

    const containerStyle = {
        padding: '20px',
        textAlign: alignment || 'center',
        background: isEditorPreview ? 'var(--platform-card-bg)' : 'transparent'
    };

    const previewStyle = {
        display: 'inline-block',
        padding: '12px 24px',
        backgroundColor: styleType === 'secondary' ? 'var(--platform-card-bg)' : 'var(--platform-accent)',
        color: styleType === 'secondary' ? 'var(--platform-text-primary)' : 'var(--platform-accent-text)',
        border: styleType === 'secondary' ? '1px solid var(--platform-border-color)' : 'none',
        textDecoration: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    };

    if (isEditorPreview) {
        return (
            <div style={containerStyle}>
                <a href="#" style={previewStyle} onClick={(e) => e.preventDefault()}>
                    {text || 'Кнопка'}
                </a>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <a 
                href={link || '#'} 
                className={`btn-site ${themeClass}`}
                target={targetBlank ? '_blank' : '_self'}
                rel={targetBlank ? 'noopener noreferrer' : ''}
            >
                {text || 'Кнопка'} 
            </a>
        </div>
    );
};

export default ButtonBlock;