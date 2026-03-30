// frontend/src/modules/editor/blocks/Footer/FooterBlock.jsx
import React, { useId } from 'react';
import { useBlockFonts } from '../../../../shared/hooks/useBlockFonts';
import { BASE_URL } from '../../../../shared/config';
import { Facebook, Instagram, Send, Youtube, Music, Twitter, Linkedin, Github } from 'lucide-react';

const IconsMap = {
    facebook: Facebook,
    instagram: Instagram,
    telegram: Send,
    youtube: Youtube,
    tiktok: Music,
    twitter: Twitter,
    linkedin: Linkedin,
    github: Github,
    default: Send
};

const FooterBlock = ({ blockData, siteData, isEditorPreview, style }) => {
    const data = blockData || {};
    const reactId = useId().replace(/:/g, '');
    const {
        variant = 'standard',
        theme_mode = 'dark',
        bg_type = 'color',
        bg_color = '#111827',
        bg_opacity = 1,
        bg_image,
        overlay_color = '#000000',
        overlay_opacity = 0.5,
        copyright = `© ${new Date().getFullYear()} Назва компанії`,
        links = [],
        socials = [],
        contentFontFamily,
        styles = {}
    } = data;

    const { styles: fontStyles, RenderFonts, cssVariables } = useBlockFonts({
        content: contentFontFamily
    }, siteData);
    let rawOpacity = Number(overlay_opacity);
    if (isNaN(rawOpacity)) rawOpacity = 0.5;
    const safeOpacity = rawOpacity > 1 ? rawOpacity / 100 : rawOpacity;
    const fullImageUrl = bg_image 
        ? (bg_image.startsWith('http') ? bg_image : `${BASE_URL}${bg_image}`)
        : null;

    const getTextColor = () => {
        if (theme_mode === 'dark') return '#ffffff';
        if (theme_mode === 'light') return 'var(--site-text-primary, #111827)';
        return 'inherit';
    };
    const computedTextColor = getTextColor();
    const isTransparent = overlay_color === 'transparent';
    const textHoverClass = theme_mode === 'dark' ? 'hover:text-white/80' : 'hover:text-black/70';
    const uniqueClass = `footer-scope-${data.id || reactId}`;
    const renderBackground = () => (
        <div className="absolute inset-0 z-0 overflow-hidden">
            {bg_type === 'color' && (
                <div className="absolute inset-0" style={{ backgroundColor: bg_color, opacity: bg_opacity }} />
            )}
            {bg_type === 'image' && fullImageUrl && (
                <div 
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${fullImageUrl})` }} 
                />
            )}
            {bg_type === 'image' && !isTransparent && (
                <div
                    className="absolute inset-0 z-1 transition-all duration-300"
                    style={{ backgroundColor: overlay_color, opacity: safeOpacity }}
                />
            )}
        </div>
    );

    return (
        <footer 
            className={`
                relative w-full flex flex-col overflow-hidden
                ${variant === 'simple' ? 'py-8' : 'py-12'}
                ${uniqueClass}
            `}
            style={{ 
                ...styles,
                ...style,
                color: computedTextColor,
                ...cssVariables
            }}
            id={data.anchorId}
        >
            <RenderFonts />
            <style>{`.${uniqueClass} { ${fontStyles.cssVars || ''} }`}</style>
            {renderBackground()}
            <div className="relative z-10 container mx-auto px-4 w-full">
                {variant === 'simple' ? (
                    <div className="text-center">
                        <p className="text-sm m-0 opacity-80" style={{ fontFamily: fontStyles.content }}>
                            {copyright}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex flex-col items-center md:items-start gap-3">
                            <p className="text-sm m-0 opacity-80" style={{ fontFamily: fontStyles.content }}>
                                {copyright}
                            </p>
                        </div>
                        {links && links.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
                                {links.map((link, idx) => (
                                    <a 
                                        key={link.id || idx} 
                                        href={link.link || '#'} 
                                        className={`transition-colors no-underline text-inherit opacity-90 ${textHoverClass}`}
                                        style={{ fontFamily: fontStyles.content }}
                                        onClick={(e) => isEditorPreview && e.preventDefault()}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        )}
                        {socials && socials.length > 0 && (
                            <div className="flex gap-4">
                                {socials.map((social, idx) => {
                                    const IconComponent = IconsMap[social.platform] || IconsMap.default;
                                    return (
                                        <a 
                                            key={social.id || idx} 
                                            href={social.link || '#'} 
                                            className={`transition-transform duration-200 no-underline text-inherit opacity-90 hover:opacity-100 hover:scale-110`}
                                            title={social.platform}
                                            onClick={(e) => isEditorPreview && e.preventDefault()}
                                        >
                                            <IconComponent size={20} />
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </footer>
    );
};

export default FooterBlock;