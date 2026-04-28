// frontend/src/modules/editor/blocks/Header/HeaderBlock.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../../app/providers/AuthContext';
import { FavoritesContext } from '../../../../app/providers/FavoritesContext';
import { resolveSiteLink } from '../../../../shared/utils/linkUtils';
import { useBlockFonts } from '../../../../shared/hooks/useBlockFonts';
import { BASE_URL } from '../../../../shared/config';
import { Settings, Star, Menu, ArrowRight, ShoppingCart, Mail, Phone, Check, MousePointer2, Star as StarIcon } from 'lucide-react';

const ICON_MAP = {
    arrowRight: ArrowRight, cart: ShoppingCart, mail: Mail, phone: Phone, check: Check, none: null, star: StarIcon, pointer: MousePointer2
};

const formatRadius = (val) => {
    if (val === undefined || val === null || val === '') return '0px';
    const str = String(val);
    return str.endsWith('px') ? str : `${str}px`;
};

const resolveUrl = (src) => {
    if (!src) return null;
    if (typeof src === 'string') {
        if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) return src;
        if (src.startsWith('/logos/')) return src;
        if (src.includes('/src/') || src.includes('/assets/') || src.includes('@fs')) return src;
        const cleanSrc = src.startsWith('/') ? src : `/${src}`;
        return `${BASE_URL}${cleanSrc}`;
    }
    return null;
};

const HeaderBlock = React.memo(({ blockData, siteData, isEditorPreview, onMenuToggle }) => {
    const { 
        show_title, nav_items = [], logo_size = 'medium', nav_alignment = 'right',
        nav_style = 'text', nav_fontFamily, buttonSettings = {}, logo_radius, borderRadius
    } = blockData;
    const effectiveLogoRadius = logo_radius !== undefined ? logo_radius : (borderRadius || 0);
    const { styles: fontStyles, RenderFonts, cssVariables } = useBlockFonts({
        navText: nav_fontFamily, btnFont: buttonSettings.fontFamily 
    }, siteData);
    
    let effectiveLogoSrc = blockData.logo_src;
    let effectiveTitle = blockData.site_title;
    if (effectiveLogoSrc === undefined || effectiveLogoSrc === null) {
        if (siteData?.logo_url) effectiveLogoSrc = siteData.logo_url;
    }
    if (effectiveTitle === undefined || effectiveTitle === null) {
        if (siteData?.title) effectiveTitle = siteData.title || 'Site Title';
    }

    const { user } = useContext(AuthContext) || {};
    const favContext = useContext(FavoritesContext) || {};
    const favoriteSiteIds = favContext.favoriteSiteIds || new Set();
    const addFavorite = favContext.addFavorite || (() => console.warn('FavoritesProvider missing'));
    const removeFavorite = favContext.removeFavorite || (() => console.warn('FavoritesProvider missing'));
    const isOwner = user && siteData && user.id === siteData.user_id;
    const isFavorite = siteData && favoriteSiteIds.has(parseInt(siteData.id));
    const logoUrl = resolveUrl(effectiveLogoSrc);
    const NavWrapper = isEditorPreview ? 'div' : Link;
    const ActionWrapper = isEditorPreview ? 'div' : Link;
    const siteRoot = resolveSiteLink('/', siteData?.site_path);
    const homeLink = isEditorPreview ? '#' : siteRoot;
    const isStickyBlock = blockData.is_sticky && !isEditorPreview;
    const getLogoHeight = () => {
        switch (logo_size) {
            case 'small': return '30px';
            case 'large': return '80px'; 
            case 'medium': default: return '50px';
        }
    };

    const btnVariant = buttonSettings.variant || 'solid';
    const btnStyleType = buttonSettings.styleType || 'primary';
    const btnRadius = buttonSettings.borderRadius !== undefined ? parseInt(buttonSettings.borderRadius) : 4;
    const btnSize = buttonSettings.size || 'medium';
    const colorVar = btnStyleType === 'secondary' ? 'var(--site-text-primary)' : 'var(--site-accent)';
    const btnCssVars = {
        '--nav-btn-bg': btnVariant === 'outline' ? 'transparent' : colorVar,
        '--nav-btn-color': btnVariant === 'outline' ? colorVar : (btnStyleType === 'secondary' ? 'var(--site-bg)' : '#ffffff'),
        '--nav-btn-border': btnVariant === 'outline' ? `2px solid ${colorVar}` : '2px solid transparent',
        '--nav-btn-hover-bg': btnVariant === 'outline' ? `color-mix(in srgb, ${colorVar} 10%, transparent)` : colorVar,
        '--nav-btn-hover-opacity': btnVariant === 'solid' ? '0.9' : '1',
    };

    let btnPadding = '8px 16px';
    let btnFontSize = '0.95rem';
    if (btnSize === 'small') { btnPadding = '6px 12px'; btnFontSize = '0.85rem'; }
    if (btnSize === 'large') { btnPadding = '12px 24px'; btnFontSize = '1.05rem'; }
    const iconBtnClass = `
        header-action-btn flex items-center justify-center w-11 h-11 rounded-xl border cursor-pointer transition-all duration-200 shrink-0 backdrop-blur-md
        border-(--site-border-color) bg-(--site-card-bg)/90
    `;

    return (
        <header 
            className={`
                flex items-center justify-between w-full transition-all duration-300
                bg-(--site-header-bg,var(--site-bg)) text-(--site-text-primary)
                ${isStickyBlock ? 'sticky top-0 z-90' : 'relative'}
                py-3 px-4 @3xl:py-4 @3xl:px-8 gap-4 @3xl:gap-8
            `}
            style={cssVariables}
        >
            <RenderFonts />
            <style>{`
                .nav-style-text:hover { color: var(--site-accent); }
                .nav-style-button {
                    background: var(--nav-btn-bg);
                    color: var(--nav-btn-color);
                    border: var(--nav-btn-border);
                }
                .nav-style-button:hover {
                    background: var(--nav-btn-hover-bg);
                    opacity: var(--nav-btn-hover-opacity);
                    transform: translateY(-1px);
                }
                .header-action-btn {
                    color: var(--site-text-secondary);
                }
                .header-action-btn:hover {
                    color: var(--site-accent) !important;
                    border-color: var(--site-accent) !important;
                    background-color: var(--site-bg) !important;
                }
                
                ${isFavorite && !isOwner ? `
                    .favorite-btn-active {
                        border-color: var(--site-accent) !important;
                        background: var(--site-bg) !important;
                        color: var(--site-accent) !important;
                    }
                ` : ''}
            `}</style>

            <NavWrapper to={homeLink} className="flex items-center gap-3 no-underline text-inherit shrink-0 cursor-pointer" onClick={e => isEditorPreview && e.preventDefault()}>
                {logoUrl && (
                    <img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="w-auto object-contain transition-[height] duration-200 max-w-37.5 @3xl:max-w-50 @5xl:max-w-75" 
                        style={{ height: getLogoHeight(), borderRadius: formatRadius(effectiveLogoRadius) }} 
                    />
                )}
                {show_title && (
                    <span 
                        className="font-bold whitespace-nowrap overflow-hidden text-ellipsis text-[1rem] @3xl:text-[1.2rem] max-w-35 @3xl:max-w-50 @5xl:max-w-75" 
                        style={{ fontFamily: fontStyles.navText }}
                    >
                        {effectiveTitle}
                    </span>
                )}
            </NavWrapper>

            <nav
                className="hidden @5xl:flex gap-6 flex-1 px-5 items-center" 
                style={{ justifyContent: nav_alignment === 'center' ? 'center' : (nav_alignment === 'left' ? 'flex-start' : 'flex-end') }}
            >
                {nav_items.map((item) => {
                    const isBtnStyle = nav_style === 'button';
                    const IconComp = (isBtnStyle && buttonSettings.icon && buttonSettings.icon !== 'none') ? ICON_MAP[buttonSettings.icon] : null;
                    const iconPos = buttonSettings.iconPosition || 'right';
                    const isFlipped = buttonSettings.iconFlip;
                    return (
                        <NavWrapper 
                            key={item.id} 
                            to={isEditorPreview ? '#' : resolveSiteLink(item.link, siteData?.site_path)} 
                            onClick={e => isEditorPreview && e.preventDefault()} 
                            className={`
                                no-underline transition-all duration-200 cursor-pointer 
                                ${isBtnStyle ? 'nav-style-button flex items-center justify-center gap-2 font-semibold' : 'nav-style-text font-medium text-[0.95rem] py-1 text-inherit'}
                            `}
                            style={isBtnStyle ? {
                                ...btnCssVars,
                                borderRadius: `${btnRadius}px`,
                                fontFamily: fontStyles.btnFont,
                                padding: btnPadding,
                                fontSize: btnFontSize,
                                lineHeight: 1
                            } : { fontFamily: fontStyles.navText }}
                        >
                            {isBtnStyle && IconComp && iconPos === 'left' && <IconComp size={16} style={{ transform: isFlipped ? 'scaleX(-1)' : 'none' }} />}
                            <span>{item.label}</span>
                            {isBtnStyle && IconComp && iconPos === 'right' && <IconComp size={16} style={{ transform: isFlipped ? 'scaleX(-1)' : 'none' }} />}
                        </NavWrapper>
                    );
                })}
            </nav>
            <div className="flex items-center gap-2 shrink-0">
                {nav_items.length > 0 && (
                    <div 
                        className={`@5xl:hidden ${iconBtnClass}`}
                        title="Меню" 
                        onClick={onMenuToggle}
                    >
                        <Menu size={22} />
                    </div>
                )}
                {isOwner ? (
                    <ActionWrapper 
                        to={`/dashboard/${siteData?.site_path}`} 
                        className={`${iconBtnClass} no-underline`}
                        title="Налаштування сайту" 
                        onClick={e => isEditorPreview && e.preventDefault()} 
                    >
                        <Settings size={22} />
                    </ActionWrapper>
                ) : (
                    <button 
                        className={`${iconBtnClass} ${isFavorite ? 'favorite-btn-active' : ''}`}
                        onClick={() => !isEditorPreview && (isFavorite ? removeFavorite(siteData.id) : addFavorite(siteData.id))} 
                        title={isFavorite ? "Видалити з обраних" : "Додати в обрані"} 
                    >
                        <Star size={22} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                )}
            </div>
        </header>
    );
});

export default HeaderBlock;