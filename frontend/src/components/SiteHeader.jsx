// frontend/src/components/SiteHeader.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import apiClient from '../services/api';
import { AuthContext } from '../features/auth/AuthContext';
import { FavoritesContext } from '../features/favorites/FavoritesContext';

const API_URL = 'http://localhost:5000';

const SiteHeader = ({ pathParam, sidebarWidth }) => {
    const { user } = useContext(AuthContext);
    const { favoriteSiteIds, addFavorite, removeFavorite } = useContext(FavoritesContext);
    const [siteData, setSiteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        if (!pathParam) { setLoading(false); return; }
        
        const isProductPage = location.pathname.startsWith('/product/');

        const fetchSiteData = async () => {
            try {
                setLoading(true);
                let sitePathForLink = pathParam;
                
                if (isProductPage) {
                    const productId = pathParam;
                    const productResponse = await apiClient.get(`/products/${productId}`);
                    const sitePath = productResponse.data.site_path;
                    if (sitePath) {
                        const siteResponse = await apiClient.get(`/sites/${sitePath}`);
                        setSiteData(siteResponse.data);
                        sitePathForLink = sitePath;
                    }
                } else {
                    const response = await apiClient.get(`/sites/${pathParam}`);
                    setSiteData(response.data);
                }

            } catch (err) {
                console.error("Не вдалося завантажити дані сайту для шапки", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSiteData();
    }, [pathParam, location.pathname]);

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 2rem',
        borderBottom: '1px solid var(--platform-border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        backdropFilter: 'blur(10px)',
        width: `calc(100% - ${sidebarWidth})`,
        left: sidebarWidth,
        transition: 'width 0.3s ease, left 0.3s ease, background-color 0.3s ease'
    };

    const iconButtonStyle = {
        background: 'none', 
        border: 'none', 
        cursor: 'pointer', 
        padding: 0,
        color: 'var(--platform-text-secondary)',
        transition: 'color 0.2s ease'
    };

    if (loading || !siteData) {
        return <header style={{ ...headerStyle, backgroundColor: 'var(--platform-card-bg)', borderBottom: '1px solid var(--platform-border-color)' }} />;
    }

    const isOwner = user && siteData && user.id === siteData.user_id;
    const isFavorite = favoriteSiteIds.has(siteData.id);

    const handleToggleFavorite = () => {
        if (!user) return;
        isFavorite ? removeFavorite(siteData.id) : addFavorite(siteData.id);
    };

    const handleIconMouseEnter = (e) => {
        e.target.style.color = 'var(--platform-accent)';
    };

    const handleIconMouseLeave = (e) => {
        e.target.style.color = 'var(--platform-text-secondary)';
    };

    return (
        <header style={headerStyle}>
            <Link to={`/site/${siteData.site_path}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'inherit' }}>
                <img 
                    src={`${API_URL}${siteData.logo_url}`} 
                    alt="Логотип сайту" 
                    style={{ height: '50px', width: '50px', objectFit: 'contain' }} 
                />
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {siteData.title}
                </span>
            </Link>

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
                        to={`/dashboard/${pathParam}`} 
                        title="Панель управління" 
                        style={iconButtonStyle}
                        onMouseEnter={handleIconMouseEnter}
                        onMouseLeave={handleIconMouseLeave}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </Link>
                )}
            </div>
        </header>
    );
};

export default SiteHeader;