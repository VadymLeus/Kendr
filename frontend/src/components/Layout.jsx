// frontend/src/components/Layout.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../features/auth/AuthContext';
import PlatformSidebar from './PlatformSidebar';
import AdminSidebar from '../admin/AdminSidebar';
import SiteHeader from './SiteHeader';
import Footer from './Footer';
import apiClient from '../services/api';

const EXPANDED_SIDEBAR_WIDTH = '220px';
const COLLAPSED_SIDEBAR_WIDTH = '80px';

const Layout = () => {
    const { user, isAdmin, isLoading: isAuthLoading } = useContext(AuthContext);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const [siteData, setSiteData] = useState(null);
    const [isSiteLoading, setIsSiteLoading] = useState(true);

    const currentSidebarWidth = isCollapsed ? COLLAPSED_SIDEBAR_WIDTH : EXPANDED_SIDEBAR_WIDTH;
    const handleToggleSidebar = () => setIsCollapsed(prev => !prev);

    const siteHeaderMatch = location.pathname.match(/^\/(site|product|dashboard)\/([^/]+)/);
    const shouldShowSiteHeader = !!siteHeaderMatch;
    const pathParam = shouldShowSiteHeader ? siteHeaderMatch[2] : null;
    const isDashboard = location.pathname.startsWith('/dashboard/');
    const isProductPage = location.pathname.startsWith('/product/');

    const shouldShowFooter = !isAdmin;

    useEffect(() => {
        if (!pathParam) {
            setIsSiteLoading(false);
            setSiteData(null);
            return;
        }

        const fetchSiteData = async () => {
            try {
                setIsSiteLoading(true);
                let sitePathToFetch = pathParam;

                if (isProductPage) {
                    const productResponse = await apiClient.get(`/products/${pathParam}`);
                    sitePathToFetch = productResponse.data.site_path;
                }
                
                if (sitePathToFetch) {
                    const response = await apiClient.get(`/sites/${sitePathToFetch}`);
                    setSiteData(response.data);
                } else {
                    setSiteData(null);
                }
               
            } catch (err) {
                console.error("Layout: Не вдалося завантажити дані сайту", err);
                setSiteData(null);
            } finally {
                setIsSiteLoading(false);
            }
        };

        fetchSiteData();
    }, [pathParam, isProductPage]);

    if (isAuthLoading) {
        return <div>Завантаження...</div>;
    }

    document.documentElement.style.setProperty('--sidebar-width', currentSidebarWidth);
    
    const mainStyles = {
        padding: isDashboard ? 0 : '2rem',
        flexGrow: 1,
    };

    if (shouldShowSiteHeader && !isSiteLoading && siteData) {
        mainStyles.background = 'var(--site-bg)';
        mainStyles.color = 'var(--site-text-primary)';
    } else if (shouldShowSiteHeader) {
        mainStyles.background = 'var(--platform-bg)';
    }
    
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {isAdmin ? (
                <AdminSidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
            ) : (
                <PlatformSidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
            )}

            <div className="layout-content">
                {shouldShowSiteHeader && (
                    <SiteHeader 
                        siteData={siteData} 
                        loading={isSiteLoading}
                        sidebarWidth={currentSidebarWidth} 
                    />
                )}
                
                <main 
                    style={mainStyles}
                    className={shouldShowSiteHeader && !isSiteLoading && siteData ? "site-theme-context" : ""}
                    data-site-mode={siteData?.site_theme_mode || 'light'}
                    data-site-accent={siteData?.site_theme_accent || 'orange'}
                >
                    <Outlet context={{ siteData, isSiteLoading }} />
                </main>
                
                {shouldShowFooter && <Footer />}
            </div>
        </div>
    );
};

export default Layout;