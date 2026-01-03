// frontend/src/modules/site-editor/blocks/Header/HeaderBlock.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../app/providers/AuthContext';
import { FavoritesContext } from '../../../../app/providers/FavoritesContext';
import { resolveSiteLink } from '../../../../common/utils/linkUtils';
import { IconSettings, IconStar, IconList } from '../../../../common/components/ui/Icons';

const API_URL = 'http://localhost:5000';

const HeaderBlock = ({ blockData, siteData, isEditorPreview }) => {
    const { 
        logo_src, 
        site_title, 
        show_title, 
        nav_items = [],
        logo_size = 'medium',
        nav_alignment = 'right',
        nav_style = 'text'
    } = blockData;

    const { user } = useContext(AuthContext);
    const { favoriteSiteIds, addFavorite, removeFavorite } = useContext(FavoritesContext);
    const navigate = useNavigate();

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: 'var(--site-header-bg, var(--site-bg))',
        borderBottom: `1px solid var(--site-border-color)`,
        color: 'var(--site-text-primary)', 
        position: 'relative',
        transition: 'background-color 0.3s, color 0.3s',
        gap: '2rem' 
    };

    const getLogoHeight = () => {
        switch (logo_size) {
            case 'small': return '30px';
            case 'large': return '80px';
            case 'medium': 
            default: return '50px';
        }
    };

    const logoSectionStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        textDecoration: 'none',
        color: 'inherit',
        cursor: isEditorPreview ? 'default' : 'pointer',
        flexShrink: 0
    };

    const logoImgStyle = {
        height: getLogoHeight(),
        width: 'auto',
        objectFit: 'contain',
        transition: 'height 0.2s ease'
    };

    const navContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
    };

    const navLinksContainerStyle = {
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        marginLeft: nav_alignment === 'left' ? '0' : 'auto',
        marginRight: nav_alignment === 'right' ? '0' : 'auto',
        justifyContent: nav_alignment === 'center' ? 'center' : 'flex-start',
        width: nav_alignment === 'center' ? '100%' : 'auto'
    };

    const getNavLinkStyle = () => {
        const baseStyle = {
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            cursor: isEditorPreview ? 'default' : 'pointer',
            display: 'inline-block'
        };

        if (nav_style === 'button') {
            return {
                ...baseStyle,
                padding: '8px 16px',
                backgroundColor: 'var(--site-accent)',
                color: 'var(--site-accent-text)', 
                borderRadius: 'var(--btn-radius, 8px)',
                border: 'none'
            };
        }
        
        return {
            ...baseStyle,
            color: 'inherit',
            opacity: 0.9
        };
    };

    const actionButtonStyle = {
        background: 'transparent',
        border: 'none',
        cursor: isEditorPreview ? 'default' : 'pointer',
        color: 'inherit',
        marginLeft: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        flexShrink: 0,
        padding: '8px',
        borderRadius: '50%' 
    };

    const ownerButtonStyle = {
        ...actionButtonStyle,
        fontSize: '0.9rem',
        border: `1px solid var(--site-border-color)`, 
        padding: '6px 12px',
        borderRadius: '6px', 
        textDecoration: 'none',
        gap: '0.5rem',
        backgroundColor: 'var(--site-card-bg)',
        fontWeight: 500
    };
    
    const siteRoot = resolveSiteLink('/', siteData?.site_path);
    const homeLink = isEditorPreview ? '#' : siteRoot;

    const getNavLink = (link) => {
        if (isEditorPreview) return '#';
        return resolveSiteLink(link, siteData?.site_path);
    };

    const isOwner = user && siteData && user.id === siteData.user_id;
    const isFavorite = siteData && favoriteSiteIds.has(parseInt(siteData.id));

    const handleToggleFavorite = () => {
        if (isEditorPreview) return;
        if (!user) {
            if (window.confirm("Увійдіть, щоб додати сайт в обране. Перейти на сторінку входу?")) {
                navigate('/login');
            }
            return;
        }
        isFavorite ? removeFavorite(siteData.id) : addFavorite(siteData.id);
    };

    const logoUrl = logo_src 
        ? (logo_src.startsWith('http') ? logo_src : `${API_URL}${logo_src}`)
        : null;

    const NavWrapper = isEditorPreview ? 'div' : Link;
    const ActionWrapper = isEditorPreview ? 'div' : Link;

    const linkStyle = getNavLinkStyle();

    return (
        <header style={headerStyle}>
            <NavWrapper to={homeLink} style={logoSectionStyle} onClick={e => isEditorPreview && e.preventDefault()}>
                {logoUrl && <img src={logoUrl} alt="Logo" style={logoImgStyle} />}
                {show_title && <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{site_title}</span>}
            </NavWrapper>

            <div className="desktop-nav" style={navContainerStyle}>
                <nav style={navLinksContainerStyle}>
                    {nav_items.map((item) => (
                        <NavWrapper 
                            key={item.id} 
                            to={getNavLink(item.link)} 
                            style={linkStyle}
                            onClick={e => isEditorPreview && e.preventDefault()}
                            onMouseEnter={e => {
                                if (nav_style === 'text') e.target.style.color = 'var(--site-accent)';
                                if (nav_style === 'button') e.target.style.opacity = '0.9';
                            }}
                            onMouseLeave={e => {
                                if (nav_style === 'text') e.target.style.color = 'inherit';
                                if (nav_style === 'button') e.target.style.opacity = '1';
                            }}
                        >
                            {item.label}
                        </NavWrapper>
                    ))}
                </nav>
            </div>

            <div style={{ 
                borderLeft: `1px solid var(--site-border-color)`, 
                paddingLeft: '1rem', 
                display: 'flex', 
                alignItems: 'center' 
            }}>
                {isOwner ? (
                    <ActionWrapper 
                        to={`/dashboard/${siteData?.site_path}`}
                        style={ownerButtonStyle}
                        title="Перейти в панель управління"
                        onClick={e => isEditorPreview && e.preventDefault()}
                        onMouseEnter={(e) => {
                            if (!isEditorPreview) {
                                e.currentTarget.style.borderColor = 'var(--site-accent)';
                                e.currentTarget.style.backgroundColor = 'var(--site-bg)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isEditorPreview) {
                                e.currentTarget.style.borderColor = 'var(--site-border-color)';
                                e.currentTarget.style.backgroundColor = 'var(--site-card-bg)';
                            }
                        }}
                    >
                        <IconSettings size={18} />
                        <span>Налаштування</span>
                    </ActionWrapper>
                ) : (
                    <button 
                        style={actionButtonStyle}
                        onClick={handleToggleFavorite}
                        title={isFavorite ? "Видалити з обраних" : "Додати в обрані"}
                        onMouseEnter={(e) => {
                            if (!isEditorPreview) {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.backgroundColor = 'var(--site-hover-bg, rgba(0,0,0,0.05))';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isEditorPreview) {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
                        }}
                    >
                        {isFavorite 
                            ? <IconStar size={24} filled style={{ color: 'var(--site-accent)' }} />
                            : <IconStar size={24} style={{ color: 'var(--site-accent)' }} />
                        }
                    </button>
                )}
            </div>

            <div className="mobile-burger" style={{ display: 'none' }}>
                <IconList size={28} />
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                    .mobile-burger { display: block !important; cursor: pointer; margin-left: auto; }
                }
            `}</style>
        </header>
    );
};

export default HeaderBlock;