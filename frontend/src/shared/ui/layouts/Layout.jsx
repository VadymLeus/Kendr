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
import { Megaphone } from 'lucide-react';

const AnnouncementTimer = ({ targetTime }) => {
    const [timeLeft, setTimeLeft] = useState(null);
    useEffect(() => {
        if (!targetTime) return;
        const update = () => {
            const now = Date.now();
            const diff = targetTime - now;
            if (diff <= 0) {
                setTimeLeft(null);
                return;
            }
            const h = Math.floor((diff / 1000 / 60 / 60));
            const m = Math.floor((diff / 1000 / 60) % 60);
            const s = Math.floor((diff / 1000) % 60);
            let timeString = '';
            if (h > 0) {
                timeString = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            } else {
                timeString = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            }
            setTimeLeft(timeString);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [targetTime]);

    if (!timeLeft) return null;
    return <span className="font-mono font-bold ml-1"> - {timeLeft}</span>;
};

const Layout = () => {
    const { user, isAdmin, isLoading: isAuthLoading } = useContext(AuthContext);
    const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
    const location = useLocation();
    const [siteData, setSiteData] = useState(null);
    const [isSiteLoading, setIsSiteLoading] = useState(true);
    const [globalAnnouncement, setGlobalAnnouncement] = useState(null);
    const [announcementText, setAnnouncementText] = useState('');
    const [announcementTargetTime, setAnnouncementTargetTime] = useState(null);
    const handleToggleSidebar = () => {
        setIsCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem('sidebarCollapsed', newState.toString());
            return newState;
        });
    };
    useEffect(() => {
        if (!globalAnnouncement) {
            setAnnouncementText('');
            setAnnouncementTargetTime(null);
            return;
        }

        if (globalAnnouncement.includes('|||')) {
            const [text, timeStr] = globalAnnouncement.split('|||');
            setAnnouncementText(text);
            const time = parseInt(timeStr, 10);
            if (!isNaN(time) && time > Date.now()) {
                setAnnouncementTargetTime(time);
            } else {
                setAnnouncementTargetTime(null);
            }
        } else {
            setAnnouncementText(globalAnnouncement);
            setAnnouncementTargetTime(null);
        }
    }, [globalAnnouncement]);
    useEffect(() => {
        const handleAnnouncementUpdate = (event) => {
            setGlobalAnnouncement(event.detail);
        };
        window.addEventListener('global_announcement_update', handleAnnouncementUpdate);
        if (!globalAnnouncement) {
             apiClient.get('/auth/me').catch(() => {});
        }
        const intervalId = setInterval(() => {
            apiClient.get('/auth/me', { suppressToast: true }).catch(() => {});
        }, 30000);

        return () => {
            window.removeEventListener('global_announcement_update', handleAnnouncementUpdate);
            clearInterval(intervalId);
        };
    }, []);
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
    const themeStyle = isSiteThemeActive ? {
        '--site-bg': '#ffffff',
        '--site-text-primary': '#1a202c',
        '--site-accent': siteAccent,
        '--site-accent-hover': adjustColor(siteAccent, -10),
        '--site-accent-text': isLightColor(siteAccent) ? '#000' : '#fff',
        '--font-heading': themeSettings.font_heading || "'Inter', sans-serif",
        '--font-body': themeSettings.font_body || "'Inter', sans-serif",
        '--btn-radius': themeSettings.button_radius || '8px',
    } : {};

    const scrollClass = isAppPage ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden';
    const paddingClass = (isAppPage || isSiteThemeActive) ? 'p-0' : 'p-8';

    return (
        <div className="layout-wrapper flex flex-col h-screen relative overflow-hidden bg-(--platform-bg)">
            <TitleManager siteData={siteData} key={location.pathname} />
            <PlatformBackground />
            {announcementText && (
                <div className="bg-(--platform-accent) text-(--platform-accent-text) w-full z-50 shadow-md animate-in slide-in-from-top-2 shrink-0">
                    <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center justify-center gap-3 w-full">
                            <Megaphone size={18} className="shrink-0 animate-pulse" />
                            <span className="text-sm font-medium">
                                {announcementText}
                                {announcementTargetTime && (
                                    <AnnouncementTimer targetTime={announcementTargetTime} />
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden h-full w-full">
                <PlatformSidebar 
                    isCollapsed={isCollapsed} 
                    onToggle={handleToggleSidebar} 
                    variant={isAdmin ? 'admin' : 'user'}
                />
                <div 
                    className={`
                        layout-content 
                        flex-1 
                        flex 
                        flex-col 
                        h-full 
                        min-w-0
                        ${isCollapsed ? 'collapsed' : ''} 
                        ${isSiteThemeActive ? 'site-theme-context' : ''}
                        ${scrollClass}
                    `}
                    style={themeStyle}
                >
                    {siteData?.theme_settings && (
                        <FontLoader fontHeading={siteData.theme_settings.font_heading} fontBody={siteData.theme_settings.font_body} />
                    )}
                    {shouldShowSiteHeader && (
                        <SiteHeader siteData={siteData} loading={isSiteLoading} />
                    )}
                    <main 
                        className={`flex-1 w-full ${paddingClass}`}
                        style={isSiteThemeActive ? themeStyle : undefined} 
                    >
                        <Outlet context={{ siteData, setSiteData, isSiteLoading, isCollapsed, globalAnnouncement, setGlobalAnnouncement }} />
                    </main>
                    {shouldShowFooter && <Footer />}
                </div>
            </div>
        </div>
    );
};

export default Layout;