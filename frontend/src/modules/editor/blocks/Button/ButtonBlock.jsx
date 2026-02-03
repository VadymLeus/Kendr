// frontend/src/modules/editor/blocks/Button/ButtonBlock.jsx
import React from 'react';
import { resolveSiteLink } from '../../../../shared/utils/linkUtils';
import { useBlockFonts } from '../../../../shared/hooks/useBlockFonts';
import { ArrowRight, ShoppingCart, Mail, Phone, Check, Star, MousePointer2, Download, FileText } from 'lucide-react';

const API_URL = 'http://localhost:5000';
const ButtonBlock = ({ blockData, siteData, isEditorPreview, style }) => {
    const { 
        text = 'Кнопка', 
        link, 
        styleType = 'primary', 
        variant = 'solid', 
        size = 'medium',
        width = 'auto',
        borderRadius = 4,
        targetBlank,
        icon = 'none',
        iconPosition = 'right',
        iconFlip = false,
        alignment = 'center', 
        theme_mode = 'light',
        fontFamily,
        isFile = false,
        height = 'small',
        styles = {}
    } = blockData;

    const { styles: fontStyles, RenderFonts, cssVariables } = useBlockFonts({
        main: fontFamily
    }, siteData);
    const accentColor = 'var(--site-accent, #3b82f6)';
    const textColor = 'var(--site-text-primary, #111827)';
    const whiteColor = '#ffffff';
    const secondaryColor = theme_mode === 'dark' ? whiteColor : textColor;
    const colorVar = styleType === 'secondary' ? secondaryColor : accentColor;
    const isOutline = variant === 'outline';
    const dynamicBtnStyle = {
        background: isOutline ? 'transparent' : colorVar,
        color: isOutline ? colorVar : (styleType === 'secondary' && !isOutline ? whiteColor : whiteColor),
        border: isOutline ? `2px solid ${colorVar}` : '2px solid transparent',
    };

    const sizeMap = {
        small:  { padding: '8px 16px',  fontSize: '0.85rem' },
        medium: { padding: '12px 24px', fontSize: '1rem' },
        large:  { padding: '16px 32px', fontSize: '1.2rem' }
    };

    const justifyMap = {
        left: 'flex-start',
        center: 'center',
        right: 'flex-end'
    };
    const justifyContent = width === 'full' ? 'stretch' : (justifyMap[alignment] || 'center');
    const safeRadius = parseInt(borderRadius) || 0;
    const uniqueClass = `btn-scope-${blockData.id || 'preview'}`;
    const heightMap = { 
        small: 'auto', 
        medium: '250px', 
        large: '400px', 
        full: 'calc(100vh - 60px)',
        auto: 'auto'
    };

    let hrefValue = '#';
    if (link) {
        if (isFile) {
            hrefValue = link.startsWith('http') ? link : `${API_URL}${link}`;
        } else {
            hrefValue = resolveSiteLink(link, siteData?.site_path);
        }
    }

    const effectiveIcon = (isFile && icon === 'none') ? 'download' : icon;
    
    return (
        <div 
            className={uniqueClass}
            style={{ 
                display: 'flex',
                width: '100%',
                justifyContent: justifyContent,
                minHeight: heightMap[height] || 'auto',
                alignItems: 'center',
                backgroundColor: 'var(--site-bg, #f7fafc)', 
                color: 'var(--site-text-primary)',
                ...styles,
                ...style,
                ...cssVariables 
            }}
        >
            <RenderFonts />
            <style>{`.${uniqueClass} { ${fontStyles.cssVars || ''} }`}</style>

            <style>{`
                .btn-${styleType}-${variant}:hover { opacity: 0.9; transform: translateY(-1px); }
                .btn-${styleType}-${variant}:active { transform: translateY(0); }
            `}</style>
            
            <a 
                href={hrefValue} 
                className={`btn-${styleType}-${variant}`}
                target={(targetBlank || isFile) ? '_blank' : '_self'}
                rel={(targetBlank || isFile) ? 'noopener noreferrer' : ''}
                download={isFile} 
                onClick={(e) => isEditorPreview && e.preventDefault()}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'transform 0.1s ease, box-shadow 0.2s ease, opacity 0.2s',
                    width: width === 'full' ? '100%' : 'auto',
                    fontFamily: fontStyles.main,
                    borderRadius: `${safeRadius}px`,
                    lineHeight: 1, 
                    ...sizeMap[size || 'medium'],
                    ...dynamicBtnStyle
                }}
            >
                {iconPosition === 'left' && <ButtonIcon name={effectiveIcon} size={size} flip={iconFlip} />}
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    {text}
                </span>
                {iconPosition === 'right' && <ButtonIcon name={effectiveIcon} size={size} flip={iconFlip} />}
            </a>
        </div>
    );
};

const ButtonIcon = ({ name, size, flip }) => {
    if (!name || name === 'none') return null;
    const s = size === 'large' ? 20 : 18;
    const style = {
        transform: flip ? 'scaleX(-1)' : 'none',
        flexShrink: 0
    };

    const icons = {
        arrowRight: <ArrowRight size={s} style={style} />,
        cart: <ShoppingCart size={s} style={style} />,
        mail: <Mail size={s} style={style} />,
        phone: <Phone size={s} style={style} />,
        check: <Check size={s} style={style} />,
        star: <Star size={s} fill="currentColor" style={style} />,
        pointer: <MousePointer2 size={s} style={style} />,
        download: <Download size={s} style={style} />, 
        file: <FileText size={s} style={style} />      
    };
    return icons[name] || icons.arrowRight;
};

export default ButtonBlock;