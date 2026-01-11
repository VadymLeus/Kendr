// frontend/src/modules/editor/blocks/Button/ButtonBlock.jsx
import React from 'react';
import { resolveSiteLink } from '../../../../shared/lib/utils/linkUtils';
import { 
    ArrowRight, 
    ShoppingCart, 
    Mail, 
    Phone, 
    Check, 
    Star, 
    MousePointer2 
} from 'lucide-react';

const ButtonBlock = ({ blockData, siteData, isEditorPreview, style }) => {
    const { 
        text = 'Кнопка', 
        link, 
        styleType = 'primary', 
        variant = 'solid', 
        size = 'medium',
        width = 'auto',
        borderRadius = '4px',
        withShadow = false,
        alignment = 'center', 
        targetBlank,
        icon = 'none',
        iconPosition = 'right'
    } = blockData;

    const colorVar = styleType === 'secondary' 
        ? 'var(--site-text-primary, #333)' 
        : 'var(--site-accent, #3b82f6)'; 

    const textOnColor = '#ffffff'; 

    const isOutline = variant === 'outline';

    const dynamicStyle = {
        background: isOutline ? 'transparent' : colorVar,
        color: isOutline ? colorVar : textOnColor,
        border: isOutline ? `2px solid ${colorVar}` : '2px solid transparent',
        boxShadow: withShadow ? '0 4px 14px rgba(0,0,0,0.15)' : 'none',
    };

    const sizeMap = {
        small:  { padding: '8px 16px',  fontSize: '0.85rem' },
        medium: { padding: '12px 24px', fontSize: '1rem' },
        large:  { padding: '16px 32px', fontSize: '1.2rem' }
    };
    const currentSize = sizeMap[size] || sizeMap.medium;

    const containerStyle = {
        padding: '20px 0',
        display: 'flex',
        justifyContent: width === 'full' ? 'stretch' : (
            alignment === 'left' ? 'flex-start' : 
            alignment === 'right' ? 'flex-end' : 'center'
        ),
        background: isEditorPreview ? 'var(--site-card-bg, transparent)' : 'transparent',
        border: isEditorPreview ? '1px dashed var(--site-border-color, transparent)' : 'none',
        borderRadius: isEditorPreview ? '8px' : '0',
        transition: 'all 0.3s ease',
        ...style
    };

    const buttonStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        textDecoration: 'none',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'transform 0.1s ease, box-shadow 0.2s ease, opacity 0.2s',
        width: width === 'full' ? '100%' : 'auto',
        borderRadius: borderRadius,
        ...currentSize,
        ...dynamicStyle
    };

    const handleClick = (e) => {
        if (isEditorPreview) {
            e.preventDefault();
        }
    };

    const finalLink = resolveSiteLink(link, siteData?.site_path);

    const renderIcon = () => {
        const iconProps = { size: size === 'large' ? 20 : 18 };
        switch (icon) {
            case 'arrowRight': return <ArrowRight {...iconProps} />;
            case 'cart': return <ShoppingCart {...iconProps} />;
            case 'mail': return <Mail {...iconProps} />;
            case 'phone': return <Phone {...iconProps} />;
            case 'check': return <Check {...iconProps} />;
            case 'star': return <Star {...iconProps} fill="currentColor" />;
            case 'pointer': return <MousePointer2 {...iconProps} />;
            default: return null;
        }
    };

    const IconElement = renderIcon();

    return (
        <div style={containerStyle}>
            <style>{`
                .btn-block-${styleType}-${variant}:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                    ${withShadow ? 'box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important;' : ''}
                }
                .btn-block-${styleType}-${variant}:active {
                    transform: translateY(0);
                }
            `}</style>
            
            <a 
                href={finalLink} 
                className={`btn-block-${styleType}-${variant}`}
                target={targetBlank ? '_blank' : '_self'}
                rel={targetBlank ? 'noopener noreferrer' : ''}
                onClick={handleClick}
                style={buttonStyle}
            >
                {iconPosition === 'left' && IconElement}
                <span>{text}</span>
                {iconPosition === 'right' && IconElement}
            </a>
        </div>
    );
};

export default ButtonBlock;