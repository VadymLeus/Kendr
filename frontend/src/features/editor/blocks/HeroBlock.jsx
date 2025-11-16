// frontend/src/features/editor/blocks/HeroBlock.jsx
import React from 'react';

const HeroBlock = ({ blockData, siteData, isEditorPreview }) => {
    const { title, subtitle, buttonText, buttonLink, imageUrl } = blockData;

    const textPrimary = isEditorPreview ? 'var(--platform-text-primary)' : 'var(--site-text-primary)';
    const textSecondary = isEditorPreview ? 'var(--platform-text-secondary)' : 'var(--site-text-secondary)';
    const accent = isEditorPreview ? 'var(--platform-accent)' : 'var(--site-accent)';
    const accentText = isEditorPreview ? 'var(--platform-accent-text)' : 'var(--site-accent-text)';
    const accentHover = isEditorPreview ? 'var(--platform-accent-hover)' : 'var(--site-accent-hover)';

    const containerStyle = {
        padding: '50px 20px', 
        textAlign: 'center', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        background: imageUrl ? `url(${imageUrl})` : (isEditorPreview ? 'var(--platform-card-bg)' : 'var(--site-bg)'),
    };
    
    const titleStyle = {
        color: textPrimary,
        margin: '0 0 0.5rem 0'
    };
    
    const subtitleStyle = {
        color: textSecondary,
        margin: '0 0 1.5rem 0'
    };

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
    };

    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>{title}</h1>
            <p style={subtitleStyle}>{subtitle}</p>
            {buttonText && (
                <a 
                    href={buttonLink || '#'} 
                    style={buttonStyle}
                    onMouseEnter={(e) => { e.target.style.backgroundColor = accentHover; }}
                    onMouseLeave={(e) => { e.target.style.backgroundColor = accent; }}
                >
                    {buttonText}
                </a>
            )}
        </div>
    );
};

export default HeroBlock;