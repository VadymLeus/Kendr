// frontend/src/modules/editor/blocks/Hero/HeroBlock.jsx
import React, { useRef, useEffect } from 'react';
import { useBlockFonts } from '../../../../shared/hooks/useBlockFonts';
import ButtonBlock from '../Button/ButtonBlock'; 

const API_URL = 'http://localhost:5000';
const HeroBlock = ({ blockData = {}, siteData, isEditorPreview, style }) => {
    const { 
        bg_type = 'image',
        bg_image, 
        bg_video,
        title, 
        subtitle, 
        button_text, 
        button_link,
        button = {}, 
        alignment = 'center', 
        height = 'medium', 
        styles = {}, 
        titleFontFamily, 
        contentFontFamily,
        theme_mode = 'auto', 
        overlay_opacity,
        overlay_color = '#000000',
    } = blockData || {};

    const { styles: fontStyles, RenderFonts, cssVariables } = useBlockFonts({
        title: titleFontFamily,
        content: contentFontFamily
    }, siteData);

    const videoRef = useRef(null);
    const safeOpacity = (overlay_opacity === undefined || isNaN(Number(overlay_opacity))) 
        ? 0.5 : Number(overlay_opacity);

    const getTextColor = () => {
        if (theme_mode === 'dark') return '#ffffff';
        if (theme_mode === 'light') return 'var(--site-text-primary, #000000)';
        return 'var(--site-text-primary)'; 
    };

    const computedTextColor = getTextColor();
    const computedTextShadow = theme_mode === 'dark' ? '0 2px 4px rgba(0,0,0,0.5)' : 'none';
    const fullImageUrl = bg_image 
        ? (bg_image.startsWith('http') ? bg_image : `${API_URL}${bg_image}`)
        : null;
    const fullVideoUrl = bg_video 
        ? (bg_video.startsWith('http') ? bg_video : `${API_URL}${bg_video}`)
        : null;

    useEffect(() => {
        const video = videoRef.current;
        if (video && bg_type === 'video') {
            video.play().catch(e => console.error("Autoplay failed", e));
        }
    }, [bg_type, fullVideoUrl]);

    const heightMap = { 
        small: '300px', 
        medium: '500px', 
        large: '700px', 
        full: 'calc(100vh - 60px)'
    };

    const activeMinHeight = heightMap[height] || '500px';
    const alignMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
    const containerStyle = {
        position: 'relative',
        width: '100%',
        minHeight: activeMinHeight,
        ...styles,
        backgroundColor: 'var(--site-bg)', 
        color: computedTextColor,
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
        color: 'inherit',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: alignMap[alignment] || 'center'
    };

    const isTransparent = overlay_color === 'transparent';
    const renderBackground = () => {
        if (bg_type === 'video' && fullVideoUrl) {
            return (
                <video ref={videoRef} src={fullVideoUrl} poster={fullImageUrl}
                    autoPlay muted loop playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            );
        }
        if (fullImageUrl) {
            return (
                <div style={{
                    width: '100%', height: '100%',
                    backgroundImage: `url(${fullImageUrl})`,
                    backgroundSize: 'cover', backgroundPosition: 'center'
                }} />
            );
        }
        return null;
    };

    const resolvedButtonData = {
        text: button.text || button_text,
        link: button.link || button_link,
        size: button.size || 'large', 
        styleType: button.styleType || 'primary',
        variant: button.variant || 'solid',
        targetBlank: button.targetBlank,
        icon: button.icon,
        iconPosition: button.iconPosition,
        borderRadius: button.borderRadius,
        fontFamily: button.fontFamily || contentFontFamily, 
        width: button.width || 'auto',
        theme_mode: theme_mode
    };

    const uniqueClass = `hero-scope-${(blockData && blockData.id) ? blockData.id : 'preview'}`;
    return (
        <div 
            style={{ 
                ...containerStyle, 
                ...cssVariables 
            }} 
            className={uniqueClass}
            id={blockData.anchorId}
        >
            <RenderFonts />
            
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                {renderBackground()}
            </div>

            {!isTransparent && (
                <div style={{
                    position: 'absolute', inset: 0, backgroundColor: overlay_color,
                    opacity: safeOpacity, zIndex: 1, transition: 'background-color 0.3s, opacity 0.3s'
                }}></div>
            )}

            <div style={contentStyle}>
                {title && <h1 style={{ 
                    fontFamily: fontStyles.title, 
                    fontSize: isEditorPreview ? '2rem' : 'clamp(2rem, 5vw, 3.5rem)',
                    fontWeight: '800', margin: '0 0 1rem 0', lineHeight: '1.1',
                    color: 'inherit', textShadow: computedTextShadow
                }}>{title}</h1>}
                
                {subtitle && <p style={{ 
                    fontFamily: fontStyles.content,
                    fontSize: isEditorPreview ? '1rem' : 'clamp(1rem, 2vw, 1.25rem)',
                    margin: '0 0 2rem 0', opacity: 0.9, lineHeight: '1.6',
                    color: 'inherit', maxWidth: '600px',
                    textShadow: computedTextShadow, whiteSpace: 'pre-wrap'
                }}>{subtitle}</p>}
                
                {resolvedButtonData.text && (
                    <div style={{ marginTop: '8px' }}>
                        <ButtonBlock 
                            blockData={resolvedButtonData} 
                            siteData={siteData} 
                            isEditorPreview={isEditorPreview}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeroBlock;