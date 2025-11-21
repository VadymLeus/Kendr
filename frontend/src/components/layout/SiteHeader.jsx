// frontend/src/components/layout/SiteHeader.jsx
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../providers/AuthContext';
import { FavoritesContext } from '../../providers/FavoritesContext';

const API_URL = 'http://localhost:5000';

const SiteHeader = ({ siteData, loading, sidebarWidth }) => {
    const { user } = useContext(AuthContext);
    const { favoriteSiteIds, addFavorite, removeFavorite } = useContext(FavoritesContext);
    
    const baseHeaderStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '0.5rem 2rem',
        borderBottom: '1px solid var(--site-border-color)', 
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'var(--site-header-bg, var(--site-bg))', 
        color: 'var(--site-text-primary)', 
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease'
    };

    const iconButtonStyle = {
        background: 'none', 
        border: 'none', 
        cursor: 'pointer', 
        padding: 0,
        color: 'var(--site-text-secondary)', 
        transition: 'color 0.2s ease'
    };
    
    if (loading || !siteData) {
        const loadingHeaderStyle = { 
            ...baseHeaderStyle, 
            backgroundColor: 'var(--platform-card-bg)', 
            borderBottom: '1px solid var(--platform-border-color)',
            color: 'var(--platform-text-primary)'
        };
        return <header style={{...loadingHeaderStyle, transition: 'none'}} />;
    }

    const isOwner = user && siteData && user.id === siteData.user_id;
    const isFavorite = favoriteSiteIds.has(siteData.id);
    const headerSettings = siteData.header_settings || {};
    const layout = headerSettings.layout || 'layout_1';
    const logoUrl = headerSettings.logo_url || siteData.logo_url;
    const menuLinks = headerSettings.menu_links || [];

    const handleToggleFavorite = () => {
        if (!user) return;
        isFavorite ? removeFavorite(siteData.id) : addFavorite(siteData.id);
    };
    const handleIconMouseEnter = (e) => { e.target.style.color = 'var(--site-accent)'; };
    const handleIconMouseLeave = (e) => { e.target.style.color = 'var(--site-text-secondary)'; };

    const LogoBrand = () => (
        <Link 
            to={`/site/${siteData.site_path}`} 
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                textDecoration: 'none', 
                color: 'var(--site-text-primary)' 
            }}
        >
            <img 
                src={`${API_URL}${logoUrl}`}
                alt="Логотип сайту" 
                style={{ height: '50px', width: '50px', objectFit: 'contain' }} 
            />
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {siteData.title}
            </span>
        </Link>
    );

    const Navigation = () => (
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
            {menuLinks.map((link, index) => (
                <Link
                    key={index}
                    to={link.url.startsWith('/') ? link.url : `/site/${siteData.site_path}/${link.url.replace(/^\//, '')}`}
                    style={{
                        textDecoration: 'none',
                        color: 'var(--site-text-primary)',
                        fontWeight: '500',
                        fontSize: '0.95rem',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--site-accent)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--site-text-primary)'}
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );

    const ActionIcons = () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user && !isOwner && (
                <button 
                    onClick={handleToggleFavorite} 
                    title={isFavorite ? "Видалити з обраних" : "Додати в обрані"} 
                    style={iconButtonStyle}
                    onMouseEnter={handleIconMouseEnter}
                    onMouseLeave={handleIconMouseLeave}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? "gold" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                </button>
            )}
            {isOwner && (
                <Link 
                    to={`/dashboard/${siteData.site_path}`}
                    title="Панель управління" 
                    style={iconButtonStyle}
                    onMouseEnter={handleIconMouseEnter}
                    onMouseLeave={handleIconMouseLeave}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </Link>
            )}
        </div>
    );

    let headerProps = {
        style: {
            ...baseHeaderStyle,
            justifyContent: 'space-between'
        },
        className: "site-theme-context",
        "data-site-mode": siteData.site_theme_mode || 'light',
        "data-site-accent": siteData.site_theme_accent || 'orange'
    };
    
    let content;

    if (layout === 'layout_2') {
        headerProps.style.flexDirection = 'column';
        headerProps.style.alignItems = 'center';
        headerProps.style.gap = '0.5rem';
        
        content = (
            <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }} />
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <LogoBrand />
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <ActionIcons />
                    </div>
                </div>
                <Navigation />
            </>
        );
        
    } else {
        headerProps.style.justifyContent = 'space-between';

        const leftSideContent = layout === 'layout_3' 
            ? <><Navigation /> <LogoBrand /></>
            : <><LogoBrand /> <Navigation /></>;

        content = (
            <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    {leftSideContent}
                </div>
                <ActionIcons />
            </>
        );
    }

    return (
        <header {...headerProps}>
            {content}
        </header>
    );
};

export default SiteHeader;