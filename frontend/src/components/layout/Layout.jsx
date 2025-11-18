// frontend/src/components/layout/Layout.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../../providers/AuthContext';
import PlatformSidebar from './PlatformSidebar';
import AdminSidebar from './AdminSidebar';
import SiteHeader from './SiteHeader';
import Footer from './Footer';
import apiClient from '../../services/api';

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

    const dashboardMatch = location.pathname.match(/^\/dashboard\/([^/]+)/);
    const publicMatch = location.pathname.match(/^\/site\/([^/]+)(?:\/([^/]+))?/);
    const productMatch = location.pathname.match(/^\/product\/([^/]+)/);
    
    const shouldShowSiteHeader = !!(publicMatch || productMatch);
    const shouldShowFooter = !isAdmin && !dashboardMatch;
    
    useEffect(() => {
        const fetchSiteData = async () => {
            setIsSiteLoading(true);
            setSiteData(null);
            try {
                let url = null;
                let params = { increment_view: 'false' }; 

                if (dashboardMatch) {
                    const sitePath = dashboardMatch[1];
                    url = `/sites/${sitePath}`;
                } else if (publicMatch) {
                    const sitePath = publicMatch[1];
                    const slug = publicMatch[2];
                    if (slug) {
                        url = `/sites/${sitePath}/${slug}`;
                    } else {
                        url = `/sites/${sitePath}`;
                    }
                } else if (productMatch) {
                    const productId = productMatch[1];
                    const productResponse = await apiClient.get(`/products/${productId}`);
                    const sitePath = productResponse.data.site_path;
                    url = `/sites/${sitePath}`;
                }

                if (url) {
                    const response = await apiClient.get(url, { params });
                    setSiteData(response.data);
                }
            } catch (err) {
                console.error("Layout: не вдалося завантажити дані сайту", err.response?.data?.message || err.message);
                setSiteData(null);
            } finally {
                setIsSiteLoading(false);
            }
        };

        if (dashboardMatch || publicMatch || productMatch) {
            fetchSiteData();
        } else {
            setIsSiteLoading(false);
            setSiteData(null);
        }
    }, [location.pathname]);

    if (isAuthLoading) {
        return <div>Завантаження...</div>;
    }

    document.documentElement.style.setProperty('--sidebar-width', currentSidebarWidth);
    
    const themeSettings = siteData?.theme_settings || {};
    
    const isPublicPage = !!(publicMatch || productMatch);
    const mainStyles = {
        padding: dashboardMatch ? 0 : '2rem',
        flexGrow: 1,
    };
    if (isPublicPage && siteData) {
        mainStyles['--font-heading'] = themeSettings.font_heading || 'sans-serif';
        mainStyles['--font-body'] = themeSettings.font_body || 'sans-serif';
        mainStyles['--btn-radius'] = themeSettings.button_radius || '4px';
    }
    
    if (shouldShowSiteHeader && !isSiteLoading && siteData) {
        if (isPublicPage) {
            mainStyles.background = 'var(--site-bg)';
            mainStyles.color = 'var(--site-text-primary)';
        } else {
            mainStyles.background = 'var(--platform-bg)';
            mainStyles.color = 'var(--platform-text-primary)';
        }
    } else if (shouldShowSiteHeader) {
        mainStyles.background = 'var(--platform-bg)';
    }

    const layoutContentStyle = {
        overflowY: dashboardMatch ? 'hidden' : 'auto'
    };
    
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {isAdmin ? (
                <AdminSidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
            ) : (
                <PlatformSidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
            )}

            <div className="layout-content" style={layoutContentStyle}>
                {shouldShowSiteHeader && (
                    <SiteHeader 
                        siteData={siteData} 
                        loading={isSiteLoading} 
                        sidebarWidth={currentSidebarWidth} 
                    />
                )}
                
                <main 
                    style={mainStyles}
                    className={isPublicPage && !isSiteLoading && siteData ? "site-theme-context" : ""}
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