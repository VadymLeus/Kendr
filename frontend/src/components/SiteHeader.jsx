// frontend/src/components/SiteHeader.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import apiClient from '../services/api';

const API_URL = 'http://localhost:5000';

// Додано проп `sidebarWidth` для динамічної адаптації шапки
const SiteHeader = ({ pathParam, sidebarWidth }) => {
    const [siteData, setSiteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        if (!pathParam) return;

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

    // СТИЛЬ: Динамічна адаптація шапки до ширини бічної панелі
    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 2rem',
        borderBottom: '1px solid #dee2e6',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        // Динамічна ширина та відступ для синхронізації з бічною панеллю
        width: `calc(100% - ${sidebarWidth})`, 
        left: sidebarWidth, 
        transition: 'width 0.3s ease, left 0.3s ease' // Синхронна анімація
    };

    if (loading || !siteData) {
        return <header style={headerStyle} />;
    }

    return (
        <header style={headerStyle}>
            <Link 
                to={`/site/${siteData.site_path}`} 
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    textDecoration: 'none', 
                    color: 'inherit' 
                }}
            >
                <img 
                    src={`${API_URL}${siteData.logo_url}`} 
                    alt="Логотип сайту" 
                    style={{ 
                        height: '50px', 
                        width: '50px', 
                        objectFit: 'contain' 
                    }} 
                />
                <span style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold' 
                }}>
                    {siteData.title}
                </span>
            </Link>
            {/* Меню користувача видалено, оскільки тепер воно знаходиться в бічній панелі */}
        </header>
    );
};

export default SiteHeader;