// frontend/src/components/layout/Layout.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../../providers/AuthContext';
import PlatformSidebar from './PlatformSidebar';
import AdminSidebar from './AdminSidebar';
import SiteHeader from './SiteHeader';
import Footer from './Footer';
import apiClient from '../../services/api';
import { FONT_LIBRARY } from '../../features/editor/editorConfig';
import { resolveAccentColor } from '../../features/sites/tabs/ThemeSettingsTab';

const EXPANDED_SIDEBAR_WIDTH = '220px';
const COLLAPSED_SIDEBAR_WIDTH = '80px';

const adjustColor = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
};

const isLightColor = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 128;
};

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
    const shouldShowFooter = !isAdmin && !dashboardMatch && !publicMatch && !productMatch;
    
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

    useEffect(() => {
        if (siteData && siteData.theme_settings) {
            const { font_heading, font_body } = siteData.theme_settings;
            
            const headingFontObj = FONT_LIBRARY.find(f => f.value === font_heading);
            const bodyFontObj = FONT_LIBRARY.find(f => f.value === font_body);

            const fontsToLoad = new Set();
            if (headingFontObj && headingFontObj.googleFont) fontsToLoad.add(headingFontObj.googleFont);
            if (bodyFontObj && bodyFontObj.googleFont) fontsToLoad.add(bodyFontObj.googleFont);

            if (fontsToLoad.size > 0) {
                const fontParams = Array.from(fontsToLoad)
                    .map(fontName => `family=${fontName.replace(/ /g, '+')}:wght@400;500;600;700`)
                    .join('&');
                
                const linkId = 'dynamic-google-fonts';
                let linkElement = document.getElementById(linkId);

                if (!linkElement) {
                    linkElement = document.createElement('link');
                    linkElement.id = linkId;
                    linkElement.rel = 'stylesheet';
                    document.head.appendChild(linkElement);
                }
                
                linkElement.href = `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
            }
        }
    }, [siteData]);

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

    document.documentElement.style.setProperty('--sidebar-width', currentSidebarWidth);
    
    const themeSettings = siteData?.theme_settings || {};
    const isPublicPage = !!(publicMatch || productMatch);
    
    const siteAccentHex = resolveAccentColor(siteData?.site_theme_accent || 'orange');
    const siteThemeMode = siteData?.site_theme_mode || 'light';
    
    const siteAccentHover = adjustColor(siteAccentHex, -10);
    const siteAccentLight = adjustColor(siteAccentHex, 90);
    const siteAccentText = isLightColor(siteAccentHex) ? '#000000' : '#ffffff';

    const mainStyles = {
        padding: (dashboardMatch || isPublicPage) ? 0 : '2rem', 
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
        overflowY: dashboardMatch ? 'hidden' : 'auto',
        width: '100%'
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