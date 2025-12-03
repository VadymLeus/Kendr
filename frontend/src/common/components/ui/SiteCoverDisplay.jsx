// frontend/src/common/components/ui/SiteCoverDisplay.jsx
import React from 'react';

const API_URL = 'http://localhost:5000';

const PRESET_COLORS = {
    green: '#48bb78',
    orange: '#ed8936',
    blue: '#4299e1',
    red: '#f56565',
    purple: '#9f7aea',
    yellow: '#ecc94b',
    gray: '#718096',
    black: '#000000',
};

const SiteCoverDisplay = ({ site, style, className }) => {
    const { 
        cover_image, 
        cover_layout = 'centered', 
        title, 
        logo_url,
        site_theme_accent = 'orange',
        site_theme_mode = 'light'
    } = site;

    const fullCoverImage = cover_image 
        ? (cover_image.startsWith('http') ? cover_image : `${API_URL}${cover_image}`) 
        : null;

    const fullLogoUrl = logo_url 
        ? (logo_url.startsWith('http') ? logo_url : `${API_URL}${logo_url}`)
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
        padding: '20px',
        boxSizing: 'border-box',
        backgroundColor: isDark ? '#2d3748' : '#f7fafc',
        color: isDark ? '#fff' : '#1a202c',
        transition: 'all 0.3s ease',
        ...style
    };

    if (fullCoverImage) {
        return (
            <div className={`site-cover-display mode-image ${className || ''}`} style={wrapperStyle}>
                <img 
                    src={fullCoverImage} 
                    alt={title} 
                    style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover'
                    }} 
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
        height: '48px',
        width: 'auto',
        objectFit: 'contain',
        maxWidth: '140px',
        display: 'block'
    };

    const titleStyle = {
        fontSize: '1.4rem',
        fontWeight: '700',
        lineHeight: '1.2',
        color: 'inherit',
        margin: 0,
        textAlign: 'center'
    };

    let contentContainerStyle = {
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '100%'
    };

    switch (cover_layout) {
        case 'classic':
            contentContainerStyle.flexDirection = 'row';
            contentContainerStyle.textAlign = 'left';
            break;
            
        case 'reverse':
            contentContainerStyle.flexDirection = 'row-reverse';
            contentContainerStyle.textAlign = 'right';
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
                    <div style={{ flexShrink: 0 }}>
                        <img src={fullLogoUrl} alt="Logo" style={logoStyle} />
                    </div>
                )}
                
                {showText && (
                    <div style={titleStyle}>
                        {title}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiteCoverDisplay;