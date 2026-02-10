// frontend/src/modules/editor/blocks/SocialIcons/SocialIconsBlock.jsx
import React from 'react';
import { Facebook, Instagram, Send, Youtube, Music, Share2 } from 'lucide-react';

const IconsMap = {
    facebook: Facebook,
    instagram: Instagram,
    telegram: Send,
    youtube: Youtube,
    tiktok: Music
};

const IconWrapper = ({ children, href, isEditorPreview, baseColor }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={isEditorPreview ? (e) => e.preventDefault() : undefined}
        className="inline-flex items-center justify-center w-10 h-10 mx-1 no-underline transition-all duration-200 rounded-full hover:text-(--site-accent) hover:bg-black/5 hover:-translate-y-0.5"
        style={{
            color: baseColor, 
            opacity: isEditorPreview ? 0.8 : 1, 
        }}
    >
        {children}
    </a>
);

const SocialIconsBlock = ({ blockData, isEditorPreview, style }) => {
    const { alignment, theme_mode = 'auto', facebook, instagram, telegram, youtube, tiktok } = blockData;
    let baseColor = 'var(--site-text-primary)';
    if (theme_mode === 'light') baseColor = '#1a202c';
    if (theme_mode === 'dark') baseColor = '#ffffff';
    const socialLinks = [
        { key: 'facebook', href: facebook },
        { key: 'instagram', href: instagram },
        { key: 'telegram', href: telegram },
        { key: 'youtube', href: youtube },
        { key: 'tiktok', href: tiktok },
    ].filter(item => item.href); 

    const hasLinks = socialLinks.length > 0;
    if (!hasLinks && isEditorPreview) {
        return (
            <div 
                className="p-8 text-center bg-(--site-card-bg) border border-dashed border-(--site-border-color) rounded-lg text-(--site-text-secondary) min-h-37.5 flex items-center justify-center flex-col gap-3"
                style={style}
            >
                <div className="text-(--site-accent) opacity-70">
                    <Share2 size={48} />
                </div>
                <div>
                    <p className="m-0 font-semibold text-(--site-text-primary) text-lg">Соцмережі</p>
                    <small className="block mt-1 opacity-80">Додайте посилання в налаштуваннях.</small>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`
                p-5 bg-transparent
                ${isEditorPreview ? 'border border-dashed border-(--site-border-color) rounded-lg bg-(--site-card-bg)' : ''}
            `}
            style={{ 
                textAlign: alignment || 'left',
                ...style
            }}
        >
            {socialLinks.map((net) => {
                const IconComponent = IconsMap[net.key];
                return (
                    <IconWrapper key={net.key} href={net.href} isEditorPreview={isEditorPreview} baseColor={baseColor}>
                        <IconComponent size={24} />
                    </IconWrapper>
                );
            })}
        </div>
    );
};

export default SocialIconsBlock;