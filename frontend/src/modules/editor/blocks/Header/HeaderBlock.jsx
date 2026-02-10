// frontend/src/modules/editor/blocks/Header/HeaderBlock.jsx
import React, { useContext, useState, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../../app/providers/AuthContext';
import { FavoritesContext } from '../../../../app/providers/FavoritesContext';
import { resolveSiteLink } from '../../../../shared/utils/linkUtils';
import { useBlockFonts } from '../../../../shared/hooks/useBlockFonts';
import { Settings, Star, Menu, ArrowRight, ShoppingCart, Mail, Phone, Check, MousePointer2, Star as StarIcon} from 'lucide-react';

const API_URL = 'http://localhost:5000';
const ICON_MAP = {
    arrowRight: ArrowRight,
    cart: ShoppingCart,
    mail: Mail,
    phone: Phone,
    check: Check,
    none: null,
    star: StarIcon,
    pointer: MousePointer2
};

const formatRadius = (val) => {
    if (val === undefined || val === null || val === '') return '0px';
    const str = String(val);
    return str.endsWith('px') ? str : `${str}px`;
};

const HeaderBlock = ({ blockData, siteData, isEditorPreview, onMenuToggle }) => {
    const { 
        show_title, 
        nav_items = [],
        logo_size = 'medium',
        nav_alignment = 'right',
        nav_style = 'text', 
        nav_fontFamily,     
        buttonSettings = {}, 
        logo_radius,
        borderRadius 
    } = blockData;

    const effectiveLogoRadius = logo_radius !== undefined ? logo_radius : (borderRadius || 0);
    const { styles: fontStyles, RenderFonts, cssVariables } = useBlockFonts({
        navText: nav_fontFamily,
        btnFont: buttonSettings.fontFamily 
    }, siteData);
    let effectiveLogoSrc = blockData.logo_src;
    let effectiveTitle = blockData.site_title;
    if (effectiveLogoSrc === undefined || effectiveLogoSrc === null) {
        if (siteData?.logo_url) effectiveLogoSrc = siteData.logo_url;
    }
    if (effectiveTitle === undefined || effectiveTitle === null) {
        if (siteData?.title) effectiveTitle = siteData.title || 'Site Title';
    }

    const { user } = useContext(AuthContext);
    const { favoriteSiteIds, addFavorite, removeFavorite } = useContext(FavoritesContext);
    const headerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(1200);
    useLayoutEffect(() => {
        if (!headerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        observer.observe(headerRef.current);
        return () => observer.disconnect();
    }, []);

    const IS_COMPACT_NAV = containerWidth < 850;
    const IS_COMPACT_BTN = containerWidth < 480;
    const getLogoHeight = () => {
        switch (logo_size) {
            case 'small': return '30px';
            case 'large': return '80px'; 
            case 'medium': 
            default: return '50px';
        }
    };

    const getButtonStyle = (isHovered) => {
        const { 
            variant = 'solid', 
            styleType = 'primary', 
            borderRadius: btnRadius, 
            size = 'medium'
        } = buttonSettings;
        const accentColor = 'var(--site-accent, #3b82f6)';
        const textColor = 'var(--site-text-primary, #111827)'; 
        const whiteColor = '#ffffff';
        const colorVar = styleType === 'secondary' ? textColor : accentColor;
        const isOutline = variant === 'outline';
        let padding = '8px 16px';
        let fontSize = '0.95rem';
        if (size === 'small') { padding = '6px 12px'; fontSize = '0.85rem'; }
        if (size === 'large') { padding = '12px 24px'; fontSize = '1.05rem'; }
        let background, color, border;
        if (isOutline) {
            background = isHovered ? colorVar : 'transparent';
            color = isHovered ? (styleType === 'secondary' ? 'var(--site-bg)' : whiteColor) : colorVar;
            border = `2px solid ${colorVar}`;
        } else {
            background = colorVar;
            color = whiteColor;
            if (styleType === 'secondary') {
                 color = 'var(--site-bg)'; 
            }
            border = '2px solid transparent';
        }

        const safeRadius = btnRadius !== undefined ? parseInt(btnRadius) : 4;
        return {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: `${safeRadius}px`,
            background: background,
            color: color,
            border: border,
            fontFamily: fontStyles.btnFont,
            fontSize,
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            cursor: isEditorPreview ? 'default' : 'pointer',
            padding,
            lineHeight: 1,
            opacity: (isHovered && !isOutline) ? 0.9 : 1,
            transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
        };
    };

    const [hoveredNavId, setHoveredNavId] = useState(null);
    const [isBtnHovered, setIsBtnHovered] = useState(false);
    const [isMenuHovered, setIsMenuHovered] = useState(false);
    const isOwner = user && siteData && user.id === siteData.user_id;
    const isFavorite = siteData && favoriteSiteIds.has(parseInt(siteData.id));
    const logoUrl = (effectiveLogoSrc && typeof effectiveLogoSrc === 'string')
        ? (effectiveLogoSrc.startsWith('http') ? effectiveLogoSrc : `${API_URL}${effectiveLogoSrc}`)
        : null;
    const NavWrapper = isEditorPreview ? 'div' : Link;
    const ActionWrapper = isEditorPreview ? 'div' : Link;
    const siteRoot = resolveSiteLink('/', siteData?.site_path);
    const homeLink = isEditorPreview ? '#' : siteRoot;
    const iconBtnBaseClass = "flex items-center justify-center w-10 h-10 rounded-lg border cursor-pointer transition-all duration-200 shrink-0";
    return (
        <header 
            ref={headerRef} 
            className={`
                flex items-center justify-between bg-(--site-header-bg,var(--site-bg)) border-b border-(--site-border-color) text-(--site-text-primary) relative transition-all duration-300 gap-4
                ${IS_COMPACT_BTN ? 'py-3 px-4' : 'py-4 px-8 gap-8'}
            `}
            style={cssVariables}
        >
            <RenderFonts />
            <NavWrapper 
                to={homeLink} 
                className="flex items-center gap-3 no-underline text-inherit shrink-0 cursor-pointer" 
                onClick={e => isEditorPreview && e.preventDefault()}
            >
                {logoUrl && (
                    <img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="w-auto object-contain transition-[height] duration-200 max-w-37.5"
                        style={{
                            height: getLogoHeight(),
                            borderRadius: formatRadius(effectiveLogoRadius),
                        }} 
                    />
                )}
                {show_title && (
                    <span 
                        className="font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{ 
                            fontFamily: fontStyles.navText,
                            fontSize: IS_COMPACT_BTN ? '1rem' : '1.2rem',
                            maxWidth: IS_COMPACT_NAV ? '150px' : '300px'
                        }}
                    >
                        {effectiveTitle}
                    </span>
                )}
            </NavWrapper>
            {!IS_COMPACT_NAV && (
                <nav 
                    className="flex gap-6 flex-1 px-5 items-center"
                    style={{ 
                        justifyContent: nav_alignment === 'center' ? 'center' : (nav_alignment === 'left' ? 'flex-start' : 'flex-end'),
                    }}
                >
                    {nav_items.map((item) => {
                        const isHovered = hoveredNavId === item.id;
                        let itemStyle = {};
                        if (nav_style === 'button') {
                            const btnStyle = getButtonStyle(isHovered);
                            itemStyle = { ...btnStyle };
                        } else {
                            itemStyle = {
                                textDecoration: 'none',
                                fontWeight: '500',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s ease',
                                cursor: isEditorPreview ? 'default' : 'pointer',
                                padding: '4px 0',
                                color: isHovered ? 'var(--site-accent)' : 'inherit',
                                fontFamily: fontStyles.navText
                            };
                        }

                        const IconComp = (nav_style === 'button' && buttonSettings.icon && buttonSettings.icon !== 'none') 
                            ? ICON_MAP[buttonSettings.icon] 
                            : null;
                        const iconPos = buttonSettings.iconPosition || 'right';
                        const isFlipped = buttonSettings.iconFlip;
                        return (
                            <NavWrapper 
                                key={item.id} 
                                to={isEditorPreview ? '#' : resolveSiteLink(item.link, siteData?.site_path)}
                                style={itemStyle}
                                onClick={e => isEditorPreview && e.preventDefault()}
                                onMouseEnter={() => setHoveredNavId(item.id)}
                                onMouseLeave={() => setHoveredNavId(null)}
                            >
                                {nav_style === 'button' && IconComp && iconPos === 'left' && (
                                    <IconComp size={16} style={{ transform: isFlipped ? 'scaleX(-1)' : 'none' }} />
                                )}
                                
                                <span>{item.label}</span>

                                {nav_style === 'button' && IconComp && iconPos === 'right' && (
                                    <IconComp size={16} style={{ transform: isFlipped ? 'scaleX(-1)' : 'none' }} />
                                )}
                            </NavWrapper>
                        );
                    })}
                </nav>
            )}

            <div className="flex items-center gap-2 shrink-0">
                {IS_COMPACT_NAV && (
                    <div 
                        className={`
                            ${iconBtnBaseClass}
                            ${isMenuHovered ? 'border-(--site-accent) bg-(--site-bg) text-(--site-accent)' : 'border-(--site-border-color) bg-(--site-card-bg) text-(--site-text-primary)'}
                        `}
                        title="Меню"
                        onMouseEnter={() => setIsMenuHovered(true)}
                        onMouseLeave={() => setIsMenuHovered(false)}
                        onClick={onMenuToggle}
                    >
                        <Menu size={20} />
                    </div>
                )}
                {isOwner ? (
                    <ActionWrapper 
                        to={`/dashboard/${siteData?.site_path}`}
                        className={`
                            ${iconBtnBaseClass} no-underline
                            ${isBtnHovered ? 'border-(--site-accent) bg-(--site-bg) text-(--site-accent)' : 'border-(--site-border-color) bg-(--site-card-bg) text-(--site-text-secondary)'}
                        `}
                        title="Налаштування сайту"
                        onClick={e => isEditorPreview && e.preventDefault()}
                        onMouseEnter={() => setIsBtnHovered(true)}
                        onMouseLeave={() => setIsBtnHovered(false)}
                    >
                        <Settings size={20} />
                    </ActionWrapper>
                ) : (
                    <button 
                        className={`
                            ${iconBtnBaseClass}
                            ${(isBtnHovered || (isFavorite && !isOwner)) ? 'border-(--site-accent) bg-(--site-bg) text-(--site-accent)' : 'border-(--site-border-color) bg-(--site-card-bg) text-(--site-text-secondary)'}
                        `}
                        onClick={() => !isEditorPreview && (isFavorite ? removeFavorite(siteData.id) : addFavorite(siteData.id))}
                        title={isFavorite ? "Видалити з обраних" : "Додати в обрані"}
                        onMouseEnter={() => setIsBtnHovered(true)}
                        onMouseLeave={() => setIsBtnHovered(false)}
                    >
                        <Star size={20} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                )}
            </div>
        </header>
    );
};

export default HeaderBlock;