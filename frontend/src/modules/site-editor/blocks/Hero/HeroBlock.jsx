// frontend/src/modules/site-editor/blocks/Hero/HeroBlock.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const HeroBlock = ({ blockData, isEditorPreview, style }) => {
    const { 
        bg_type = 'image',
        bg_image, 
        bg_video,
        title, 
        subtitle, 
        button_text, 
        button_link, 
        alignment = 'center', 
        height = 'medium', 
        fontFamily, 
        theme_mode = 'auto', 
        overlay_opacity,
        overlay_color = '#000000' 
    } = blockData;

    const safeOpacity = (overlay_opacity === undefined || isNaN(Number(overlay_opacity))) 
        ? 0.5 
        : Number(overlay_opacity);

    let themeClass = '';
    if (theme_mode === 'dark') themeClass = 'block-theme-dark';
    if (theme_mode === 'light') themeClass = 'block-theme-light';
    
    const fullImageUrl = bg_image 
        ? (bg_image.startsWith('http') ? bg_image : `${API_URL}${bg_image}`)
        : null;
    const fullVideoUrl = bg_video 
        ? (bg_video.startsWith('http') ? bg_video : `${API_URL}${bg_video}`)
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
        height: heightMap[height] || '500px',
        minHeight: '300px',
        backgroundColor: 'var(--site-bg)', 
        color: 'var(--site-text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: alignMap[alignment] || 'center',
        boxSizing: 'border-box',
        overflow: 'hidden',
        ...style 
    };

    const contentStyle = {
        position: 'relative',
        zIndex: 2,
        maxWidth: '800px',
        width: '100%',
        textAlign: alignment,
        padding: '0 20px',
        fontFamily: (fontFamily && fontFamily !== 'global') ? fontFamily : 'var(--site-font-main, inherit)',
        color: 'inherit' 
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
    const buttonProps = isEditorPreview ? {} : { to: button_link || '#' };
    const isTransparent = overlay_color === 'transparent';

    return (
        <div style={containerStyle} className={themeClass}>
            <div style={{
                position: 'absolute', 
                inset: 0, 
                zIndex: 0
            }}>
                {bg_type === 'video' && fullVideoUrl ? (
                    <video
                        src={fullVideoUrl}
                        poster={fullImageUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                ) : (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: fullImageUrl ? `url(${fullImageUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }} />
                )}
            </div>

            {!isTransparent && (
                <div style={{
                    position: 'absolute', 
                    inset: 0,
                    backgroundColor: overlay_color,
                    opacity: safeOpacity,
                    zIndex: 1,
                    transition: 'background-color 0.3s, opacity 0.3s'
                }}></div>
            )}

            <div style={contentStyle}>
                {title && <h1 style={{ 
                    fontSize: isEditorPreview ? '2rem' : 'clamp(2rem, 5vw, 3.5rem)',
                    fontWeight: '800',
                    margin: '0 0 1rem 0',
                    lineHeight: '1.1',
                    color: 'inherit', 
                    textShadow: theme_mode === 'light' ? 'none' : '0 2px 4px rgba(0,0,0,0.3)'
                }}>{title}</h1>}
                
                {subtitle && <p style={{ 
                    fontSize: isEditorPreview ? '1rem' : 'clamp(1rem, 2vw, 1.25rem)',
                    margin: '0 0 2rem 0',
                    opacity: 0.9,
                    lineHeight: '1.6',
                    color: 'inherit',
                    maxWidth: '600px',
                    marginLeft: alignment === 'center' ? 'auto' : '0',
                    marginRight: alignment === 'center' ? 'auto' : '0',
                    textShadow: theme_mode === 'light' ? 'none' : '0 1px 2px rgba(0,0,0,0.3)'
                }}>{subtitle}</p>}
                
                {button_text && (
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
                        {button_text}
                    </ButtonComponent>
                )}
            </div>
        </div>
    );
};

export default HeroBlock;