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

    const uniqueClass = `features-scope-${(blockData && blockData.id) ? blockData.id : 'preview'}`;
    const heightClasses = { 
        small: 'min-h-auto', 
        medium: 'min-h-[600px]', 
        large: 'min-h-[800px]', 
        full: 'min-h-[calc(100vh-60px)]',
        auto: 'min-h-auto'
    };
    const isCard = layout === 'cards';
    const isList = layout === 'list';
    const gridCols = {
        1: 'md:grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4'
    };
    let alignClass = 'items-start text-left';
    if (!isList) {
        if (align === 'center') alignClass = 'items-center text-center';
        else if (align === 'right') alignClass = 'items-end text-right';
    }

    const renderIcon = (iconName) => {
        const IconComponent = ICON_MAP[iconName] || ICON_MAP.default;
        return <IconComponent size={showIconBackground ? 32 : 40} />;
    };

    return (
        <div 
            className={`
                py-15 px-5 flex flex-col justify-center bg-(--site-bg) text-(--site-text-primary)
                ${heightClasses[height] || 'min-h-auto'}
                ${uniqueClass}
            `}
            style={{ 
                ...styles,
                ...style,
                ...cssVariables
            }}
        >
            <RenderFonts />
            <style>{`.${uniqueClass} { ${fontStyles.cssVars || ''} }`}</style>
            <style>{`
                .${uniqueClass} .feature-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
                }
                .${uniqueClass} .feature-card:hover .feature-icon {
                    transform: scale(1.1) rotate(5deg);
                }
            `}</style>
            {title && (
                <h2 
                    className="text-center mb-8 text-[2rem] text-(--site-text-primary) w-full leading-tight"
                    style={{ fontFamily: fontStyles.title }}
                >
                    {title}
                </h2>
            )}
            <div 
                className={`
                    grid grid-cols-1 gap-6 w-full
                    ${gridCols[columns] || 'md:grid-cols-2'}
                `}
            >
                {items.map((item, index) => (
                    <div 
                        key={item.id || index} 
                        className={`
                            flex relative z-10 h-full transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                            ${isList ? 'flex-row items-start gap-4' : `flex-col gap-4 ${alignClass}`}
                            ${isCard ? 'feature-card bg-(--site-card-bg) border border-(--site-border-color) p-6 shadow-sm' : 'bg-transparent border-none p-0'}
                        `}
                        style={{ 
                            borderRadius: isCard ? borderRadius : '0' 
                        }}
                    >
                        <div 
                            className={`
                                feature-icon flex items-center justify-center shrink-0 transition-all duration-300 ease-out
                                ${showIconBackground ? 'w-16 h-16 rounded-full bg-(--site-accent) text-white shadow-lg' : 'w-auto h-auto bg-transparent text-(--site-accent)'}
                                ${(!isList && !showIconBackground) ? 'mb-2' : ''}
                            `}
                        >
                            {renderIcon(item.icon)}
                        </div>
                        <div className="w-full">
                            <h4 
                                className="m-0 mb-2 text-xl font-semibold text-(--site-text-primary)"
                                style={{ fontFamily: fontStyles.content }}
                            >
                                {item.title}
                            </h4>
                            <p 
                                className="m-0 text-(--site-text-secondary) leading-relaxed text-[0.95rem] wrap-break-word"
                                style={{ fontFamily: fontStyles.content }}
                            >
                                {item.text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            {isEditorPreview && items.length === 0 && (
                <div className="text-center p-10 opacity-50 border-2 border-dashed border-(--site-border-color) rounded-lg flex flex-col items-center justify-center w-full">
                    <div className="mb-2.5 text-(--site-accent)">
                        <Star size={32} />
                    </div>
                    <span>Додайте переваги у налаштуваннях блоку</span>
                </div>
            )}
        </div>
    );
};

export default FeaturesBlock;