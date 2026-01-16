// frontend/src/modules/editor/blocks/Features/FeaturesBlock.jsx
import React from 'react';
import { useBlockFonts } from '../../../../shared/hooks/useBlockFonts';
import { Star, Zap, Shield, Truck, Gift, Clock, Phone, Settings, Check, User, Globe, Heart, ShoppingBag, Box, Smile, Award } from 'lucide-react';

const ICON_MAP = {
    star: Star, zap: Zap, shield: Shield, truck: Truck, gift: Gift,
    clock: Clock, phone: Phone, settings: Settings, check: Check,
    user: User, globe: Globe, heart: Heart, shop: ShoppingBag,
    box: Box, smile: Smile, award: Award, default: Star
};

const FeaturesBlock = ({ blockData, siteData, isEditorPreview, style }) => {
    const { 
        title, 
        items = [], 
        columns = 2, 
        layout = 'cards', 
        align = 'center',
        borderRadius = '8px',
        showIconBackground = false,
        titleFontFamily,
        contentFontFamily,
        height = 'small',
        styles = {} 
    } = blockData || {};

    const { styles: fontStyles, RenderFonts, cssVariables } = useBlockFonts({
        title: titleFontFamily,
        content: contentFontFamily
    }, siteData);

    const cssVarsString = Object.entries(cssVariables)
        .map(([key, val]) => `${key}: ${val};`)
        .join(' ');

    const uniqueClass = `features-vars-${(blockData && blockData.id) ? blockData.id : 'preview'}`;
    const heightMap = { 
        small: 'auto', 
        medium: '600px', 
        large: '800px', 
        full: 'calc(100vh - 60px)',
        auto: 'auto'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '24px',
        marginTop: '32px',
        textAlign: layout === 'list' ? 'left' : align,
        width: '100%'
    };

    const wrapperStyle = {
        padding: '60px 20px',
        backgroundColor: 'var(--site-bg, #ffffff)', 
        color: 'var(--site-text-primary)',
        border: 'none',
        borderRadius: '0',
        minHeight: heightMap[height] || 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        ...styles,
        ...style 
    };

    const isCard = layout === 'cards';
    const isList = layout === 'list';
    
    const getFlexAlign = () => {
        if (isList) return 'flex-start'; 
        if (align === 'center') return 'center';
        if (align === 'right') return 'flex-end'; 
        return 'flex-start'; 
    };

    const getItemStyle = () => ({
        display: 'flex',
        flexDirection: isList ? 'row' : 'column',
        alignItems: getFlexAlign(),
        gap: '16px',
        background: isCard ? 'var(--site-card-bg)' : 'transparent',
        border: isCard ? `1px solid var(--site-border-color)` : 'none',
        padding: isCard ? '24px' : '0',
        borderRadius: isCard ? borderRadius : '0',
        boxShadow: isCard ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        height: '100%',
        position: 'relative',
        zIndex: 1
    });

    const iconWrapperStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: showIconBackground ? '64px' : 'auto',
        height: showIconBackground ? '64px' : 'auto',
        borderRadius: showIconBackground ? '50%' : '0',
        background: showIconBackground ? 'var(--site-accent)' : 'transparent',
        color: showIconBackground ? '#ffffff' : 'var(--site-accent)',
        flexShrink: 0,
        marginBottom: isList ? '0' : '8px',
        transition: 'all 0.3s ease',
        boxShadow: showIconBackground ? '0 4px 10px rgba(0,0,0,0.15)' : 'none'
    };

    const renderIcon = (iconName) => {
        const IconComponent = ICON_MAP[iconName] || ICON_MAP.default;
        return <IconComponent size={showIconBackground ? 32 : 40} />;
    };

    return (
        <div style={wrapperStyle} className={uniqueClass}>
            <RenderFonts />
            <style>{`.${uniqueClass} { ${cssVarsString} }`}</style>

            <style>{`
                .feature-item-hoverable:hover {
                    ${isCard ? 'transform: translateY(-8px); box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important;' : ''}
                }
                .feature-item-hoverable:hover .feature-icon-wrapper {
                    transform: scale(1.1) rotate(5deg);
                }
                @media (max-width: 768px) {
                    .features-grid-resp-${columns} {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>

            {title && (
                <h2 style={{ 
                    textAlign: 'center', 
                    marginBottom: '10px',
                    fontSize: '2rem',
                    color: 'var(--site-text-primary)',
                    fontFamily: fontStyles.title,
                    width: '100%'
                }}>
                    {title}
                </h2>
            )}

            <div style={gridStyle} className={`features-grid-resp-${columns}`}>
                {items.map((item, index) => (
                    <div key={item.id || index} className="feature-item-hoverable" style={getItemStyle()}>
                        <div className="feature-icon-wrapper" style={iconWrapperStyle}>
                            {renderIcon(item.icon)}
                        </div>
                        
                        <div style={{ width: '100%' }}>
                            <h4 style={{ 
                                margin: '0 0 8px 0', 
                                fontSize: '1.25rem', 
                                fontWeight: 600,
                                color: 'var(--site-text-primary)',
                                fontFamily: fontStyles.content
                            }}>
                                {item.title}
                            </h4>
                            <p style={{ 
                                margin: 0, 
                                color: 'var(--site-text-secondary)',
                                lineHeight: '1.6',
                                fontSize: '0.95rem',
                                wordBreak: 'break-word',
                                fontFamily: fontStyles.content
                            }}>
                                {item.text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {isEditorPreview && items.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5, border: '2px dashed var(--site-border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <div style={{ marginBottom: '10px', color: 'var(--site-accent)' }}>
                        <Star size={32} />
                    </div>
                    <span>Додайте переваги у налаштуваннях блоку</span>
                </div>
            )}
        </div>
    );
};

export default FeaturesBlock;