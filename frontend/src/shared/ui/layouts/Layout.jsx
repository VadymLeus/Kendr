// frontend/src/shared/ui/layouts/Layout.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import PlatformSidebar from './PlatformSidebar';
import SiteHeader from './SiteHeader';
import Footer from './Footer';
import TitleManager from './TitleManager';
import apiClient from '../../api/api';
import { resolveAccentColor, isLightColor, adjustColor } from '../../utils/themeUtils';
import FontLoader from '../../../modules/renderer/components/FontLoader';
import PlatformBackground from './PlatformBackground';

const Layout = () => {
    const { user, isAdmin, isLoading: isAuthLoading } = useContext(AuthContext);
    const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
    const location = useLocation();
    const [siteData, setSiteData] = useState(null);
    const [isSiteLoading, setIsSiteLoading] = useState(true);
    const handleToggleSidebar = () => {
        setIsCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem('sidebarCollapsed', newState.toString());
            return newState;
        });
    };

    const dashboardMatch = location.pathname.match(/^\/dashboard\/([^/]+)/);
    const productInsideSiteMatch = location.pathname.match(/^\/site\/([^/]+)\/product\/([^/]+)/);
    const publicMatch = location.pathname.match(/^\/site\/([^/]+)(?:\/([^/]+))?/);
    const isAppPage = !!(dashboardMatch || location.pathname === '/create-site' || location.pathname === '/admin/templates');
    const isOwner = user && siteData && user.id === siteData.user_id;
    const isHiddenStatus = siteData && ['draft', 'suspended', 'private'].includes(siteData.status);
    const isMaintenanceMode = isHiddenStatus && !isOwner && !isAdmin;
    const shouldShowSiteHeader = !!(publicMatch || productInsideSiteMatch) && siteData && !isMaintenanceMode;
    const shouldShowFooter = !isAdmin && !isAppPage && !publicMatch && !productInsideSiteMatch;
    useEffect(() => {
        const fetchSiteData = async () => {
            setIsSiteLoading(true);
            setSiteData(null);
            try {
                let url = null;
                const params = { increment_view: 'false' };
                if (dashboardMatch) url = `/sites/${dashboardMatch[1]}`;
                else if (productInsideSiteMatch) url = `/sites/${productInsideSiteMatch[1]}`;
                else if (publicMatch) url = `/sites/${publicMatch[1]}${publicMatch[2] ? `/${publicMatch[2]}` : ''}`;

                if (url) {
                    const response = await apiClient.get(url, { params });
                    setSiteData(response.data);
                }
            } catch (err) {
                console.error("Layout load error", err);
            } finally {
                setIsSiteLoading(false);
            }
        };

        if (dashboardMatch || publicMatch || productInsideSiteMatch) fetchSiteData();
        else { setIsSiteLoading(false); setSiteData(null); }
    }, [location.pathname]);
    if (isAuthLoading) return <div className="flex justify-center items-center h-screen">Завантаження...</div>;
    const isSiteThemeActive = (!!(publicMatch || productInsideSiteMatch)) && !isSiteLoading && siteData && !isMaintenanceMode;
    const themeSettings = siteData?.theme_settings || {};
    const siteAccent = resolveAccentColor(siteData?.site_theme_accent || 'orange');
    const dynamicStyle = isSiteThemeActive ? {
        '--site-bg': '#ffffff',
        '--site-text-primary': '#1a202c',
        '--site-accent': siteAccent,
        '--site-accent-hover': adjustColor(siteAccent, -10),
        '--site-accent-text': isLightColor(siteAccent) ? '#000' : '#fff',
        '--font-heading': themeSettings.font_heading || "'Inter', sans-serif",
        '--font-body': themeSettings.font_body || "'Inter', sans-serif",
        '--btn-radius': themeSettings.button_radius || '8px',
        padding: 0,
        height: 'auto',
        overflow: 'visible'
    } : {
        padding: isAppPage ? 0 : '2rem',
        height: isAppPage ? '100%' : 'auto',
        overflow: isAppPage ? 'hidden' : 'visible'
    };

    return (
        <div className="layout-wrapper">
            <TitleManager siteData={siteData} key={location.pathname} />
            <PlatformBackground />
            <PlatformSidebar 
                isCollapsed={isCollapsed} 
                onToggle={handleToggleSidebar} 
                variant={isAdmin ? 'admin' : 'user'}
            />

            <div 
                className={`layout-content custom-scrollbar ${isCollapsed ? 'collapsed' : ''} ${isSiteThemeActive ? 'site-theme-context' : ''}`}
                style={isSiteThemeActive ? dynamicStyle : undefined}
            >
                {siteData?.theme_settings && (
                    <FontLoader fontHeading={siteData.theme_settings.font_heading} fontBody={siteData.theme_settings.font_body} />
                )}

                {shouldShowSiteHeader && (
                    <SiteHeader siteData={siteData} loading={isSiteLoading} />
                )}
                
                <main style={dynamicStyle}>
                    <Outlet context={{ siteData, setSiteData, isSiteLoading, isCollapsed }} />
                </main>

                {shouldShowFooter && <Footer />}
            </div>
        </div>
    );
};

export default Layout;