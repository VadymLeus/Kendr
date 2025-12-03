// frontend/src/modules/site-editor/blocks/SocialIcons/SocialIconsBlock.jsx
import React from 'react';

const IconWrapper = ({ children, href, isEditorPreview }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={isEditorPreview ? (e) => e.preventDefault() : undefined}
        style={{
            display: 'inline-block',
            margin: '0 8px',
            color: 'var(--site-text-primary)', 
            textDecoration: 'none',
            opacity: isEditorPreview ? 0.8 : 1, 
            transition: 'color 0.2s ease, transform 0.2s ease'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--site-accent)';
            e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--site-text-primary)';
            e.currentTarget.style.transform = 'scale(1)';
        }}
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ display: 'block' }}>
            {children}
        </svg>
    </a>
);

const FacebookIcon = () => <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>;
const InstagramIcon = () => <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.148 3.227-1.669 4.771-4.919 4.919-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.07-1.646-.07-4.85s.012-3.584.07-4.85c.148-3.227 1.669 4.771 4.919-4.919 1.266-.058 1.646-.07 4.85-.07zM12 0C8.74 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.74 0 12s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.74 24 12 24s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98C23.986 15.667 24 15.26 24 12s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98C15.667.014 15.26 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"></path>;
const TelegramIcon = () => <path d="m9.417 15.181-.397 5.584c.568 0 .814-.244 1.109-.537l2.663-2.545 5.518 4.041c1.012.564 1.725.267 1.998-.931L23.93 3.821l.001-.004c.308-1.423-.471-1.998-1.288-1.631L1.67 8.128c-1.39.564-1.38 1.339-.244 1.631l5.736 1.788 13.255-8.356c.619-.397 1.193-.182.723.211L9.417 15.181z"></path>;
const YouTubeIcon = () => <path d="M21.582 6.186A2.69 2.69 0 0 0 19.7 4.298C18.006 4 12 4 12 4s-6.006 0-7.702.298A2.69 2.69 0 0 0 2.418 6.186 28.37 28.37 0 0 0 2 12s0 5.814.418 7.814a2.69 2.69 0 0 0 1.884 1.888C5.994 20 12 20 12 20s6.006 0 7.702-.298a2.69 2.69 0 0 0 1.884-1.888C22 17.814 22 12 22 12s0-5.814-.418-7.814zM9.75 15.3V8.7l6.5 3.3-6.5 3.3z"></path>;
const TikTokIcon = () => <path d="M12.525 0.02c1.31-.02 2.61-.01 3.91.02.3.01.6.02.89.02.23.01.47.01.7.02.5.01 1 .03 1.5.05.24.01.48.02.72.04.24.01.48.03.72.05.49.03.98.07 1.46.13.48.05.96.12 1.44.21.48.09.95.20 1.41.33.46.13.91.28 1.35.45.43.17.86.37 1.27.59.4.22.8.48 1.18.76.38.28.74.60 1.08.96.34.36.65.75.94 1.17.29.42.55.87.78 1.34.23.47.43.96.59 1.47.16.51.29 1.04.38 1.58.10.54.17 1.09.21 1.64.04.55.05 1.10.05 1.65 0 .56-.01 1.11-.04 1.67-.03.56-.09 1.11-.18 1.66-.09.55-.22 1.09-.39 1.62-.17.53-.38 1.05-.63 1.55-.25.50-.54.98-.87 1.43-.33.45-.70.88-1.10 1.28-.40.40-.84.78-1.30 1.13-.47.35-.96.67-1.47.97-.51.30-1.04.57-1.58.80-.54.23-1.09.43-1.64.60-.55.17-1.10.30-1.65-.41-.56.11-1.11.20-1.67.26-.56.06-1.11.10-1.66.13-.55.03-1.10.04-1.65.04h-.45c-.55 0-1.10-.01-1.65-.04-.55-.03-1.10-.07-1.65-.13-.55-.06-1.10-.13-1.64-.21-.54-.08-1.08-.19-1.61-.32-.53-.13-1.05-.29-1.56-.48-.51-.19-1.01-.41-1.50-.66-.49-.25-.96-.54-1.42-.85-.45-.31-.89-.66-1.30-.10.04-.41-.39-.78-.73-1.16-.34-.38-.66-.79-.95-1.23-.29-.44-.55-.90-.79-1.38-.24-.48-.45-.98-.63-1.49-.18-.51-.33-1.04-.45-1.57-.12-.53-.21-1.07-.27-1.61-.06-.54-.10-1.08-.11-1.62 0-.55.01-1.10.04-1.65.03-.56.09-1.11.18-1.66.09-.55.22-1.09.39-1.62.17-.53.38-1.05.63-1.55.25-.50.54-.98.87-1.43.33-.45.70-.88 1.10-1.28.40-.40.84-.78 1.30-1.13.47-.35.96-.67 1.47-.97.51-.30 1.04-.57 1.58-.80.54-.23 1.09-.43 1.64-.60.55-.17 1.10-.30 1.65-.41.56-.11 1.11-.20 1.67-.26.56-.06 1.11-.10 1.66-.13.55-.03 1.10-.04 1.65-.04h.45c.15 0 .3 0 .45 0s.3 0 .45 0z"></path>;

const SocialIconsBlock = ({ blockData, isEditorPreview, style }) => {
    const { alignment, facebook, instagram, telegram, youtube, tiktok } = blockData;

    const socialMap = {
        facebook: { href: facebook, icon: <FacebookIcon /> },
        instagram: { href: instagram, icon: <InstagramIcon /> },
        telegram: { href: telegram, icon: <TelegramIcon /> },
        youtube: { href: youtube, icon: <YouTubeIcon /> },
        tiktok: { href: tiktok, icon: <TikTokIcon /> },
    };

    const hasLinks = Object.values(socialMap).some(net => net.href);
    
    const textPrimary = 'var(--site-text-primary)';
    const textSecondary = 'var(--site-text-secondary)';
    const borderColor = 'var(--site-border-color)';
    const cardBg = 'var(--site-card-bg)';

    if (!hasLinks && isEditorPreview) {
        return (
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: cardBg, 
                border: `1px dashed ${borderColor}`, 
                borderRadius: '8px',
                color: textSecondary,
                minHeight: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                ...style
            }}>
                <span style={{fontSize: '2rem'}}>📱</span>
                <p style={{margin: '0.5rem 0 0 0', fontWeight: '600', color: textPrimary}}>Соцмережі</p>
                <small style={{color: textSecondary}}>Вкажіть посилання в налаштуваннях.</small>
            </div>
        );
    }

    return (
        <div style={{ 
            padding: '20px',
            textAlign: alignment || 'left',
            background: 'transparent',
            border: isEditorPreview ? `1px dashed ${borderColor}` : 'none',
            borderRadius: isEditorPreview ? '8px' : '0',
            backgroundColor: isEditorPreview ? cardBg : 'transparent',
            ...style
        }}>
            {Object.values(socialMap).map((net, index) => (
                net.href ? (
                    <IconWrapper key={index} href={net.href} isEditorPreview={isEditorPreview}>
                        {net.icon}
                    </IconWrapper>
                ) : null
            ))}
        </div>
    );
};

export default SocialIconsBlock;