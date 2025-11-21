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
    const heightPreset = blockData.height || 'medium';
    const { fontFamily } = blockData;

    const themeMode = blockData.theme_mode || 'auto'; 
    const overlayOpacity = blockData.overlay_opacity !== undefined ? blockData.overlay_opacity : 0.5;

    let themeClass = '';
    if (themeMode === 'dark') themeClass = 'block-theme-dark';
    if (themeMode === 'light') themeClass = 'block-theme-light';
    
    const fullImageUrl = bgImage 
        ? (bgImage.startsWith('http') ? bgImage : `${API_URL}${bgImage}`)
        : null;

    const heightMap = {
        small: '300px',
        medium: '500px',
        large: '700px',
        full: 'calc(100vh - 60px)'
    };

    const alignMap = {
        left: 'flex-start',
        center: 'center',
        right: 'flex-end'
    };

    const containerStyle = {
        position: 'relative',
        width: '100%',
        height: heightMap[heightPreset] || '500px',
        minHeight: '300px',
        backgroundImage: fullImageUrl ? `url(${fullImageUrl})` : 'none',
        backgroundColor: 'var(--site-bg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: alignMap[alignment] || 'center',
        padding: '20px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        color: 'var(--site-text-primary)'
    };

    const overlayStyle = {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#000000',
        opacity: overlayOpacity,
        zIndex: 1
    };

    const contentStyle = {
        position: 'relative',
        zIndex: 2,
        maxWidth: '800px',
        width: '100%',
        textAlign: alignment,
        padding: '0 20px',
        fontFamily: (fontFamily && fontFamily !== 'global') ? fontFamily : undefined
    };
    
    const buttonStyle = {
        display: 'inline-block',
        padding: '12px 32px',
        backgroundColor: 'var(--site-accent)', 
        color: 'var(--site-accent-text)',
        borderRadius: 'var(--btn-radius, 8px)', 
        
        textDecoration: 'none',
        border: 'none',
        fontSize: '1.1rem',
        fontWeight: '600',
        cursor: isEditorPreview ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
    };

    const ButtonComponent = isEditorPreview ? 'span' : Link;
    const buttonProps = isEditorPreview ? {} : { to: buttonLink };

    return (
        <div style={containerStyle} className={themeClass}>
            <div style={overlayStyle}></div>

            <div style={contentStyle}>
                {title && <h1 style={{ 
                    fontSize: isEditorPreview ? '2rem' : 'clamp(2rem, 5vw, 3.5rem)',
                    fontWeight: '800',
                    margin: '0 0 1rem 0',
                    lineHeight: '1.1',
                    textShadow: themeMode === 'light' ? 'none' : '0 2px 4px rgba(0,0,0,0.3)',
                    color: 'var(--site-text-primary)'
                }}>{title}</h1>}
                
                {subtitle && <p style={{ 
                    fontSize: isEditorPreview ? '1rem' : 'clamp(1rem, 2vw, 1.25rem)',
                    margin: '0 0 2rem 0',
                    opacity: 0.9,
                    maxWidth: '600px',
                    marginLeft: alignment === 'center' ? 'auto' : '0',
                    marginRight: alignment === 'center' ? 'auto' : '0',
                    lineHeight: '1.6',
                    textShadow: themeMode === 'light' ? 'none' : '0 1px 2px rgba(0,0,0,0.3)',
                    color: 'var(--site-text-primary)'
                }}>{subtitle}</p>}
                
                {buttonText && (
                    <ButtonComponent 
                        {...buttonProps}
                        style={buttonStyle}
                        onMouseEnter={(e) => {
                            if (!isEditorPreview) {
                                e.target.style.backgroundColor = 'var(--site-accent-hover)';
                                e.target.style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isEditorPreview) {
                                e.target.style.backgroundColor = 'var(--site-accent)';
                                e.target.style.transform = 'translateY(0)';
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