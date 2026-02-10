// frontend/src/shared/ui/complex/SiteCoverDisplay.jsx
import React from 'react';

const API_URL = 'http://localhost:5000';
const PRESET_COLORS = {
    green: '#48bb78', orange: '#ed8936', blue: '#4299e1', red: '#f56565',
    purple: '#9f7aea', yellow: '#ecc94b', gray: '#718096', black: '#000000',
};

const SiteCoverDisplay = ({ site, style, className }) => {
    if (!site) return <div className="w-full h-full bg-gray-200" />;
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
    const wrapperBaseClass = `w-full h-full relative overflow-hidden flex items-center justify-center p-4 box-border transition-colors duration-300 ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'} ${className || ''}`;

    if (fullCoverImage) {
        return (
            <div className={`site-cover-display mode-image ${wrapperBaseClass}`} style={style}>
                <img 
                    src={fullCoverImage} 
                    alt={title} 
                    className="absolute top-0 left-0 w-full h-full object-cover"
                />
            </div>
        );
    }

    const generatedStyle = {
        ...style,
        background: isDark 
            ? `linear-gradient(135deg, #1a202c 0%, ${accentColor}22 100%)`
            : `linear-gradient(135deg, #ffffff 0%, ${accentColor}15 100%)`,
        borderBottom: `6px solid ${accentColor}`
    };

    let layoutClasses = "flex gap-3 items-center justify-center max-w-full w-full h-full overflow-hidden";
    switch (cover_layout) {
        case 'classic':
            layoutClasses += " flex-row text-left justify-start";
            break;
        case 'reverse':
            layoutClasses += " flex-row-reverse text-right justify-end";
            break;
        case 'centered_reverse':
            layoutClasses += " flex-col-reverse text-center";
            break;
        case 'minimal': 
        case 'logo_only': 
        case 'centered':
        default:
            layoutClasses += " flex-col text-center";
            break;
    }

    const showLogo = fullLogoUrl && cover_layout !== 'minimal';
    const showText = cover_layout !== 'logo_only';

    return (
        <div className={`site-cover-display mode-${cover_layout} ${wrapperBaseClass}`} style={generatedStyle}>
            <div className={layoutClasses}>
                {showLogo && (
                    <div className="shrink-0 flex justify-center items-center">
                        <img 
                            src={fullLogoUrl} 
                            alt="Logo" 
                            className="block max-w-full max-h-30 object-contain shrink-0 transition-all duration-200"
                            style={{ 
                                height: `${logoSize}px`, 
                                width: 'auto', 
                                borderRadius: `${logoRadius}px` 
                            }} 
                        />
                    </div>
                )}
                {showText && (
                    <div 
                        className="font-bold leading-tight m-0 transition-all duration-200 max-w-full wrap-break-word line-clamp-3 overflow-hidden text-inherit"
                        style={{ fontSize: `${titleSize}px` }}
                    >
                        {title}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SiteCoverDisplay;