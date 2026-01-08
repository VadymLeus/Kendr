// frontend/src/common/components/layout/Footer.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import PlatformSidebar from './PlatformSidebar';
import AdminSidebar from './AdminSidebar';
import SiteHeader from './SiteHeader';
import Footer from './Footer';
import TitleManager from './TitleManager';
import apiClient from '../../services/api';
import { resolveAccentColor, isLightColor, adjustColor } from '../../utils/themeUtils';
import FontLoader from '../../../modules/site-render/components/FontLoader';

const EXPANDED_SIDEBAR_WIDTH = '280px';
const COLLAPSED_SIDEBAR_WIDTH = '80px';

const Layout = () => {
    const { user, isAdmin, isLoading: isAuthLoading } = useContext(AuthContext);
    
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const savedState = localStorage.getItem('sidebarCollapsed');
        return savedState === 'true';
    });

    const location = useLocation();
    const [siteData, setSiteData] = useState(null);
    const [isSiteLoading, setIsSiteLoading] = useState(true);

    const currentSidebarWidth = isCollapsed ? COLLAPSED_SIDEBAR_WIDTH : EXPANDED_SIDEBAR_WIDTH;

    const handleToggleSidebar = () => {
        setIsCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem('sidebarCollapsed', newState.toString());
            return newState;
        });
    };

    useEffect(() => {
        document.documentElement.style.setProperty('--sidebar-width', currentSidebarWidth);
    }, [currentSidebarWidth]);

    const dashboardMatch = location.pathname.match(/^\/dashboard\/([^/]+)/);
    const publicMatch = location.pathname.match(/^\/site\/([^/]+)(?:\/([^/]+))?/);
    const productMatch = location.pathname.match(/^\/product\/([^/]+)/);
    
    const mediaLibraryMatch = location.pathname === '/media-library';

    const shouldShowSiteHeader = !!(publicMatch || productMatch);
    const shouldShowFooter = !isAdmin && !dashboardMatch && !publicMatch && !productMatch && !mediaLibraryMatch;
    
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
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'var(--platform-bg)',
                color: 'var(--platform-text-primary)'
            }}>
                Завантаження...
            </div>
        );
    }

    const themeSettings = siteData?.theme_settings || {};
    const isPublicPage = !!(publicMatch || productMatch);
    
    const siteAccentHex = resolveAccentColor(siteData?.site_theme_accent || 'orange');
    const siteThemeMode = siteData?.site_theme_mode || 'light';
    
    const siteAccentHover = adjustColor(siteAccentHex, -10);
    const siteAccentLight = adjustColor(siteAccentHex, 90);
    const siteAccentText = isLightColor(siteAccentHex) ? '#000000' : '#ffffff';

    const mainStyles = {
        padding: (dashboardMatch || isPublicPage || location.pathname === '/settings') ? 0 : '2rem', 
        flexGrow: 1,
        '--site-accent': siteAccentHex,
        '--site-accent-hover': siteAccentHover,
        '--site-accent-light': siteAccentLight,
        '--site-accent-text': siteAccentText,
        '--font-heading': themeSettings.font_heading || "'Inter', sans-serif",
        '--font-body': themeSettings.font_body || "'Inter', sans-serif",
        '--btn-radius': themeSettings.button_radius || '8px',
    };
    
    if (isPublicPage && !isSiteLoading && siteData) {
        mainStyles.background = 'var(--site-bg)';
        mainStyles.color = 'var(--site-text-primary)';
        
        document.documentElement.style.setProperty('--site-accent', siteAccentHex);
        document.documentElement.style.setProperty('--site-accent-hover', siteAccentHover);
        document.documentElement.style.setProperty('--site-accent-light', siteAccentLight);
        document.documentElement.style.setProperty('--site-accent-text', siteAccentText);
        document.documentElement.style.setProperty('--font-heading', themeSettings.font_heading || "'Inter', sans-serif");
        document.documentElement.style.setProperty('--font-body', themeSettings.font_body || "'Inter', sans-serif");
        document.documentElement.style.setProperty('--btn-radius', themeSettings.button_radius || '8px');
    } else if (shouldShowSiteHeader) {
        mainStyles.background = 'var(--platform-bg)';
        mainStyles.color = 'var(--platform-text-primary)';
        
        document.documentElement.style.removeProperty('--site-accent');
        document.documentElement.style.removeProperty('--site-accent-hover');
        document.documentElement.style.removeProperty('--site-accent-light');
        document.documentElement.style.removeProperty('--site-accent-text');
        document.documentElement.style.removeProperty('--font-heading');
        document.documentElement.style.removeProperty('--font-body');
        document.documentElement.style.removeProperty('--btn-radius');
    }

    const layoutContentStyle = {
        overflowY: (dashboardMatch || mediaLibraryMatch) ? 'hidden' : 'auto',
        width: '100%'
    };
    
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <TitleManager siteData={siteData} key={location.pathname} />

            {isAdmin ? (
                <AdminSidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
            ) : (
                <PlatformSidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
            )}

            <div className="layout-content" style={layoutContentStyle}>
                {siteData && siteData.theme_settings && (
                    <FontLoader 
                        fontHeading={siteData.theme_settings.font_heading}
                        fontBody={siteData.theme_settings.font_body}
                    />
                )}

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
                    data-site-mode={siteThemeMode}
                    data-site-accent={siteData?.site_theme_accent || 'orange'}
                >
                    <Outlet context={{ siteData, setSiteData, isSiteLoading }} />
                </main>
                
                {shouldShowFooter && <Footer />}
            </div>
        </div>
    );
};

export default Layout;