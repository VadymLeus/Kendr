// frontend/src/features/editor/blocks/HeroBlock.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const HeroBlock = ({ blockData, siteData, isEditorPreview }) => {
    const bgImage = blockData.bg_image || blockData.imageUrl || '';
    const title = blockData.title || '';
    const subtitle = blockData.subtitle || '';
    const buttonText = blockData.button_text || blockData.buttonText || '';
    const buttonLink = blockData.button_link || blockData.buttonLink || '#';
    const alignment = blockData.alignment || 'center';
    const overlayColor = blockData.overlay_color || 'rgba(0, 0, 0, 0.5)';
    const heightPreset = blockData.height || 'medium';
    const { fontFamily } = blockData;

    const contentColor = '#ffffff';
    
    const accent = isEditorPreview ? 'var(--platform-accent)' : 'var(--site-accent)';
    const accentHover = isEditorPreview ? 'var(--platform-accent-hover)' : 'var(--site-accent-hover)';
    const accentText = isEditorPreview ? 'var(--platform-accent-text)' : 'var(--site-accent-text)';

    const fullImageUrl = bgImage 
        ? (bgImage.startsWith('http') ? bgImage : `${API_URL}${bgImage}`)
        : null;

    const heightMap = {
        small: '300px',
        medium: '500px',
        large: '700px',
        full: 'calc(100vh - 60px)'
    };
    const blockHeight = heightMap[heightPreset] || '500px';

    const alignMap = {
        left: 'flex-start',
        center: 'center',
        right: 'flex-end'
    };
    const alignItems = alignMap[alignment] || 'center';
    const textAlign = alignment;

    const containerStyle = {
        position: 'relative',
        width: '100%',
        height: blockHeight,
        minHeight: '300px',
        backgroundImage: fullImageUrl ? `url(${fullImageUrl})` : 'none',
        backgroundColor: fullImageUrl ? 'transparent' : (isEditorPreview ? '#2d3748' : '#1a202c'),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: alignItems,
        padding: '20px',
        boxSizing: 'border-box',
        overflow: 'hidden'
    };

    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: overlayColor,
        zIndex: 1
    };

    const contentStyle = {
        position: 'relative',
        zIndex: 2,
        maxWidth: '800px',
        width: '100%',
        textAlign: textAlign,
        color: contentColor,
        padding: '0 20px',
        fontFamily: (fontFamily && fontFamily !== 'global') ? fontFamily : undefined
    };
    
    const titleStyle = {
        fontSize: isEditorPreview ? '2rem' : 'clamp(2rem, 5vw, 3.5rem)',
        fontWeight: '800',
        margin: '0 0 1rem 0',
        lineHeight: '1.1',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    };
    
    const subtitleStyle = {
        fontSize: isEditorPreview ? '1rem' : 'clamp(1rem, 2vw, 1.25rem)',
        margin: '0 0 2rem 0',
        opacity: 0.9,
        maxWidth: '600px',
        marginLeft: alignment === 'center' ? 'auto' : '0',
        marginRight: alignment === 'center' ? 'auto' : '0',
        lineHeight: '1.6',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
    };

    const buttonStyle = {
        display: 'inline-block',
        padding: '12px 32px',
        backgroundColor: accent,
        color: accentText,
        textDecoration: 'none',
        borderRadius: '50px',
        border: 'none',
        fontSize: '1.1rem',
        fontWeight: '600',
        cursor: isEditorPreview ? 'default' : 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
    };

    const ButtonComponent = isEditorPreview ? 'span' : Link;
    const buttonProps = isEditorPreview ? {} : { to: buttonLink };

    return (
        <div style={containerStyle}>
            <div style={overlayStyle}></div>

            <div style={contentStyle}>
                {title && <h1 style={titleStyle}>{title}</h1>}
                {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
                
                {buttonText && (
                    <ButtonComponent 
                        {...buttonProps}
                        style={buttonStyle}
                        onMouseEnter={(e) => {
                            if (!isEditorPreview) {
                                e.target.style.backgroundColor = accentHover;
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isEditorPreview) {
                                e.target.style.backgroundColor = accent;
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
                            }
                        }}
                    >
                        {buttonText}
                    </ButtonComponent>
                )}
            </div>
        </div>
    );
};

export default HeroBlock;