// frontend/src/modules/editor/blocks/Hero/HeroBlock.jsx
import React, { useRef, useEffect } from 'react';
import { useBlockFonts } from '../../../../shared/hooks/useBlockFonts';
import ButtonBlock from '../Button/ButtonBlock'; 
import { BASE_URL } from '../../../../shared/config';

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
        alignment = 'middle-center', 
        height = 'medium', 
        styles = {}, 
        titleFontFamily, 
        contentFontFamily,
        theme_mode = 'auto', 
        overlay_opacity,
        overlay_color = '#000000',
        show_title = true,
        show_subtitle = true,
        show_button = true,
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
        ? (bg_image.startsWith('http') ? bg_image : `${BASE_URL}${bg_image}`)
        : null;
    const fullVideoUrl = bg_video 
        ? (bg_video.startsWith('http') ? bg_video : `${BASE_URL}${bg_video}`)
        : null;

    useEffect(() => {
        const video = videoRef.current;
        if (video && bg_type === 'video') {
            video.play().catch(e => console.error("Autoplay failed", e));
        }
    }, [bg_type, fullVideoUrl]);

    const heightClasses = { 
        small: 'min-h-75',
        medium: 'min-h-125',
        large: 'min-h-175',
        full: 'min-h-[calc(100vh-60px)]'
    };

    const alignClassesMap = {
        'left': { outer: 'justify-start items-center', inner: 'items-start text-left', btn: 'justify-start' },
        'center': { outer: 'justify-center items-center', inner: 'items-center text-center', btn: 'justify-center' },
        'right': { outer: 'justify-end items-center', inner: 'items-end text-right', btn: 'justify-end' },
        'top-left': { outer: 'justify-start items-start', inner: 'items-start text-left', btn: 'justify-start' },
        'top-center': { outer: 'justify-center items-start', inner: 'items-center text-center', btn: 'justify-center' },
        'top-right': { outer: 'justify-end items-start', inner: 'items-end text-right', btn: 'justify-end' },
        'middle-left': { outer: 'justify-start items-center', inner: 'items-start text-left', btn: 'justify-start' },
        'middle-center': { outer: 'justify-center items-center', inner: 'items-center text-center', btn: 'justify-center' },
        'middle-right': { outer: 'justify-end items-center', inner: 'items-end text-right', btn: 'justify-end' },
        'bottom-left': { outer: 'justify-start items-end', inner: 'items-start text-left', btn: 'justify-start' },
        'bottom-center': { outer: 'justify-center items-end', inner: 'items-center text-center', btn: 'justify-center' },
        'bottom-right': { outer: 'justify-end items-end', inner: 'items-end text-right', btn: 'justify-end' }
    };

    const currentAlign = alignClassesMap[alignment] || alignClassesMap['middle-center'];
    const resolvedButtonData = {
        text: button.text || button_text,
        link: button.link || button_link,
        size: button.size || 'large', 
        styleType: button.styleType || 'primary',
        variant: button.variant || 'solid',
        targetBlank: button.targetBlank,
        icon: button.icon,
        iconPosition: button.iconPosition,
        iconFlip: button.iconFlip,
        borderRadius: button.borderRadius,
        fontFamily: button.fontFamily || contentFontFamily, 
        width: button.width || 'auto',
        theme_mode: theme_mode,
        height: 'auto' 
    };

    const uniqueClass = `hero-scope-${(blockData && blockData.id) ? blockData.id : 'preview'}`;
    const isTransparent = overlay_color === 'transparent';
    return (
        <div 
            style={{ 
                ...styles,
                ...style,
                backgroundColor: 'var(--site-bg)', 
                color: computedTextColor,
                ...cssVariables
            }}
            className={`
                relative w-full flex box-border overflow-hidden
                ${heightClasses[height] || 'min-h-125'}
                ${currentAlign.outer}
                ${uniqueClass}
            `}
            id={blockData.anchorId}
        >
            <RenderFonts />
            <div className="absolute inset-0 z-0">
                {bg_type === 'video' && fullVideoUrl ? (
                    <video ref={videoRef} src={fullVideoUrl} poster={fullImageUrl}
                        autoPlay muted loop playsInline
                        className="w-full h-full object-cover"
                    />
                ) : fullImageUrl ? (
                    <div 
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${fullImageUrl})` }} 
                    />
                ) : null}
            </div>
            {!isTransparent && (
                <div
                    className="absolute inset-0 z-1 transition-all duration-300"
                    style={{ backgroundColor: overlay_color, opacity: safeOpacity }}
                ></div>
            )}
            <div
                className={`
                    relative z-2 max-w-200 w-full px-5 py-12 text-inherit flex flex-col
                    ${currentAlign.inner}
                `}
            >
                {show_title && title && (
                    <h1 
                        className="m-0 mb-4 font-extrabold leading-[1.1] text-inherit"
                        style={{ 
                            fontFamily: fontStyles.title, 
                            fontSize: isEditorPreview ? '2rem' : 'clamp(2rem, 5vw, 3.5rem)',
                            textShadow: computedTextShadow
                        }}
                    >
                        {title}
                    </h1>
                )}
                {show_subtitle && subtitle && (
                    <p 
                        className="m-0 mb-8 opacity-90 leading-[1.6] text-inherit max-w-150 whitespace-pre-wrap"
                        style={{ 
                            fontFamily: fontStyles.content,
                            fontSize: isEditorPreview ? '1rem' : 'clamp(1rem, 2vw, 1.25rem)',
                            textShadow: computedTextShadow, 
                        }}
                    >
                        {subtitle}
                    </p>
                )}
                {show_button && resolvedButtonData.text && (
                    <div className={`mt-2 w-full flex ${currentAlign.btn}`}>
                        <ButtonBlock 
                            blockData={resolvedButtonData} 
                            siteData={siteData} 
                            isEditorPreview={isEditorPreview}
                            style={{ 
                                backgroundColor: 'transparent',
                                minHeight: 'auto',
                                padding: 0,
                                width: 'auto'
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeroBlock;