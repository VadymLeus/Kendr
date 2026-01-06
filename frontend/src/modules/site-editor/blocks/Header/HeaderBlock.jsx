// frontend/src/modules/site-editor/blocks/Header/HeaderBlock.jsx
import React, { useContext, useState, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../app/providers/AuthContext';
import { FavoritesContext } from '../../../../app/providers/FavoritesContext';
import { resolveSiteLink } from '../../../../common/utils/linkUtils';
import { IconSettings, IconStar, IconList } from '../../../../common/components/ui/Icons';

const API_URL = 'http://localhost:5000';

const formatBorderRadius = (radius) => {
    if (!radius) return '0px';
    return String(radius).match(/^[0-9]+$/) ? `${radius}px` : radius;
};

const HeaderBlock = ({ blockData, siteData, isEditorPreview, onMenuToggle }) => {
    const { 
        show_title, 
        nav_items = [],
        logo_size = 'medium',
        nav_alignment = 'right',
        nav_style = 'text',
        borderRadius = 0 
    } = blockData;

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
    const navigate = useNavigate();
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

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: IS_COMPACT_BTN ? '0.8rem 1rem' : '1rem 2rem', 
        backgroundColor: 'var(--site-header-bg, var(--site-bg))',
        borderBottom: `1px solid var(--site-border-color)`,
        color: 'var(--site-text-primary)', 
        position: 'relative',
        transition: 'all 0.3s ease',
        gap: IS_COMPACT_BTN ? '1rem' : '2rem'
    };

    const logoImgStyle = {
        height: getLogoHeight(),
        width: 'auto',
        objectFit: 'contain',
        transition: 'height 0.2s ease',
        borderRadius: formatBorderRadius(borderRadius),
        maxWidth: '150px' 
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
    const iconBtnBaseStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        border: '1px solid',
        cursor: isEditorPreview ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        flexShrink: 0
    };

    const actionBtnStyle = {
        ...iconBtnBaseStyle,
        borderColor: isBtnHovered ? 'var(--site-accent)' : 'var(--site-border-color)',
        backgroundColor: isBtnHovered ? 'var(--site-bg)' : 'var(--site-card-bg)',
        color: (isBtnHovered || (isFavorite && !isOwner)) ? 'var(--site-accent)' : 'var(--site-text-secondary)',
        textDecoration: 'none'
    };

    const menuBtnStyle = {
        ...iconBtnBaseStyle,
        borderColor: isMenuHovered ? 'var(--site-accent)' : 'var(--site-border-color)',
        backgroundColor: isMenuHovered ? 'var(--site-bg)' : 'var(--site-card-bg)',
        color: isMenuHovered ? 'var(--site-accent)' : 'var(--site-text-primary)',
    };

    const navLinkBaseStyle = {
        textDecoration: 'none',
        fontWeight: '500',
        fontSize: '0.95rem',
        transition: 'all 0.2s ease',
        cursor: isEditorPreview ? 'default' : 'pointer',
        padding: nav_style === 'button' ? '8px 16px' : '4px 0',
        borderRadius: nav_style === 'button' ? 'var(--btn-radius, 8px)' : '0',
    };

    return (
        <header ref={headerRef} style={headerStyle}>
            <NavWrapper to={homeLink} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit', flexShrink: 0 }} onClick={e => isEditorPreview && e.preventDefault()}>
                {logoUrl && <img src={logoUrl} alt="Logo" style={logoImgStyle} />}
                {show_title && (
                    <span style={{ 
                        fontWeight: '700', 
                        fontSize: IS_COMPACT_BTN ? '1rem' : '1.2rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: IS_COMPACT_NAV ? '150px' : '300px'
                    }}>
                        {effectiveTitle}
                    </span>
                )}
            </NavWrapper>
            {!IS_COMPACT_NAV && (
                <nav style={{ 
                    display: 'flex', 
                    gap: '24px', 
                    flex: 1, 
                    justifyContent: nav_alignment === 'center' ? 'center' : (nav_alignment === 'left' ? 'flex-start' : 'flex-end'),
                    padding: '0 20px'
                }}>
                    {nav_items.map((item) => {
                        const isHovered = hoveredNavId === item.id;
                        
                        let itemStyle = { ...navLinkBaseStyle };
                        
                        if (nav_style === 'button') {
                            itemStyle.backgroundColor = isHovered ? 'var(--site-accent-hover)' : 'var(--site-accent)';
                            itemStyle.color = 'var(--site-accent-text)'; 
                        } else {
                            itemStyle.color = isHovered ? 'var(--site-accent)' : 'inherit';
                        }

                        return (
                            <NavWrapper 
                                key={item.id} 
                                to={isEditorPreview ? '#' : resolveSiteLink(item.link, siteData?.site_path)}
                                style={itemStyle}
                                onClick={e => isEditorPreview && e.preventDefault()}
                                onMouseEnter={() => setHoveredNavId(item.id)}
                                onMouseLeave={() => setHoveredNavId(null)}
                            >
                                {item.label}
                            </NavWrapper>
                        );
                    })}
                </nav>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {IS_COMPACT_NAV && (
                    <div 
                        style={menuBtnStyle}
                        title="Меню"
                        onMouseEnter={() => setIsMenuHovered(true)}
                        onMouseLeave={() => setIsMenuHovered(false)}
                        onClick={onMenuToggle}
                    >
                        <IconList size={20} />
                    </div>
                )}
                {isOwner ? (
                    <ActionWrapper 
                        to={`/dashboard/${siteData?.site_path}`}
                        style={actionBtnStyle}
                        title="Налаштування сайту"
                        onClick={e => isEditorPreview && e.preventDefault()}
                        onMouseEnter={() => setIsBtnHovered(true)}
                        onMouseLeave={() => setIsBtnHovered(false)}
                    >
                        <IconSettings size={20} />
                    </ActionWrapper>
                ) : (
                    <button 
                        style={actionBtnStyle}
                        onClick={() => !isEditorPreview && (isFavorite ? removeFavorite(siteData.id) : addFavorite(siteData.id))}
                        title={isFavorite ? "Видалити з обраних" : "Додати в обрані"}
                        onMouseEnter={() => setIsBtnHovered(true)}
                        onMouseLeave={() => setIsBtnHovered(false)}
                    >
                        <IconStar size={20} filled={isFavorite} />
                    </button>
                )}

            </div>
        </header>
    );
};

export default HeaderBlock;