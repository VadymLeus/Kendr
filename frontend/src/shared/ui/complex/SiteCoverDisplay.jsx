// frontend/src/shared/ui/complex/SiteCoverDisplay.jsx
import React from 'react';

const API_URL = 'http://localhost:5000';
const PRESET_COLORS = {
    green: '#48bb78', orange: '#ed8936', blue: '#4299e1', red: '#f56565',
    purple: '#9f7aea', yellow: '#ecc94b', gray: '#718096', black: '#000000',
};

const SiteCoverDisplay = ({ site, style, className }) => {
    if (!site) return <div style={{ width: '100%', height: '100%', background: '#eee' }} />;
    const { 
        cover_image, 
        cover_layout = 'centered', 
        title, 
        logo_url,
        site_theme_accent = 'orange',
        site_theme_mode = 'light'
    } = site;

    const logoSize = parseInt(site.cover_logo_size) || 80;
    const logoRadius = parseInt(site.cover_logo_radius) || 0;
    const titleSize = parseInt(site.cover_title_size) || 24;
    const fullCoverImage = cover_image 
        ? (cover_image.startsWith('http') || cover_image.startsWith('data:') 
            ? cover_image 
            : `${API_URL}${cover_image}`) 
        : null;

    const fullLogoUrl = logo_url 
        ? (logo_url.startsWith('http') || logo_url.startsWith('data:') 
            ? logo_url 
            : `${API_URL}${logo_url}`)
        : null;

    const accentColor = PRESET_COLORS[site_theme_accent] || site_theme_accent || '#ed8936';
    const isDark = site_theme_mode === 'dark';
    const wrapperStyle = {
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        background: isDark ? '#2d3748' : '#f7fafc',
        color: isDark ? '#fff' : '#1a202c',
        transition: 'background 0.3s ease',
        ...style
    };

    if (fullCoverImage) {
        return (
            <div className={`site-cover-display mode-image ${className || ''}`} style={wrapperStyle}>
                <img 
                    src={fullCoverImage} 
                    alt={title} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                />
            </div>
        );
    }

    const generatedStyle = {
        ...wrapperStyle,
        background: isDark 
            ? `linear-gradient(135deg, #1a202c 0%, ${accentColor}22 100%)`
            : `linear-gradient(135deg, #ffffff 0%, ${accentColor}15 100%)`,
        borderBottom: `6px solid ${accentColor}`
    };

    const logoStyle = {
        height: `${logoSize}px`,
        width: 'auto',
        objectFit: 'contain',
        maxWidth: '100%',
        maxHeight: '120px',
        display: 'block',
        borderRadius: `${logoRadius}px`,
        transition: 'all 0.2s ease',
        flexShrink: 0
    };

    const titleStyle = {
        fontSize: `${titleSize}px`,
        fontWeight: '700',
        lineHeight: '1.2',
        color: 'inherit',
        margin: 0,
        textAlign: 'center',
        transition: 'all 0.2s ease',
        maxWidth: '100%',
        wordBreak: 'break-word',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    };

    let contentContainerStyle = {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '100%',
        width: '100%',
        height: '100%',
        overflow: 'hidden' 
    };

    switch (cover_layout) {
        case 'classic':
            contentContainerStyle.flexDirection = 'row';
            contentContainerStyle.textAlign = 'left';
            contentContainerStyle.justifyContent = 'flex-start';
            break;
        case 'reverse':
            contentContainerStyle.flexDirection = 'row-reverse';
            contentContainerStyle.textAlign = 'right';
            contentContainerStyle.justifyContent = 'flex-end';
            break;
        case 'centered_reverse':
            contentContainerStyle.flexDirection = 'column-reverse';
            contentContainerStyle.textAlign = 'center';
            break;
        case 'minimal': 
        case 'logo_only': 
        case 'centered':
        default:
            contentContainerStyle.flexDirection = 'column';
            contentContainerStyle.textAlign = 'center';
            break;
    }

    const showLogo = fullLogoUrl && cover_layout !== 'minimal';
    const showText = cover_layout !== 'logo_only';
    return (
        <div className={`site-cover-display mode-${cover_layout} ${className || ''}`} style={generatedStyle}>
            <div style={contentContainerStyle}>
                {showLogo && (
                    <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={fullLogoUrl} alt="Logo" style={logoStyle} />
                    </div>
                )}
                {showText && <div style={titleStyle}>{title}</div>}
            </div>
        </div>
    );
};

export default SiteCoverDisplay;