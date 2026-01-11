// frontend/src/modules/editor/blocks/SocialIcons/SocialIconsBlock.jsx
import React from 'react';
import { 
    Facebook, 
    Instagram, 
    Send, 
    Youtube, 
    Music, 
    Share2 
} from 'lucide-react';

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
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            margin: '0 4px',
            color: baseColor, 
            textDecoration: 'none',
            opacity: isEditorPreview ? 0.8 : 1, 
            transition: 'all 0.2s ease',
            borderRadius: '50%',
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--site-accent)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.color = baseColor;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.backgroundColor = 'transparent';
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
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: 'var(--site-card-bg)', 
                border: '1px dashed var(--site-border-color)', 
                borderRadius: '8px',
                color: 'var(--site-text-secondary)',
                minHeight: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '12px',
                ...style
            }}>
                <div style={{ color: 'var(--site-accent)', opacity: 0.7 }}>
                    <Share2 size={48} />
                </div>
                <div>
                    <p style={{margin: '0', fontWeight: '600', color: 'var(--site-text-primary)', fontSize: '1.1rem'}}>Соцмережі</p>
                    <small style={{display: 'block', marginTop: '4px', opacity: 0.8}}>Додайте посилання в налаштуваннях.</small>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            padding: '20px',
            textAlign: alignment || 'left',
            background: 'transparent',
            border: isEditorPreview ? '1px dashed var(--site-border-color)' : 'none',
borderRadius: isEditorPreview ? '8px' : '0',
            backgroundColor: isEditorPreview ? 'var(--site-card-bg)' : 'transparent',
            ...style
        }}>
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