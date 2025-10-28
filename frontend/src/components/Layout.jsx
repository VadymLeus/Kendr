// frontend/src/components/Layout.jsx
import React, { useState, useContext } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../features/auth/AuthContext';
import PlatformSidebar from './PlatformSidebar';
import AdminSidebar from '../admin/AdminSidebar';
import SiteHeader from './SiteHeader';
import Footer from './Footer';

const EXPANDED_SIDEBAR_WIDTH = '220px';
const COLLAPSED_SIDEBAR_WIDTH = '80px';

const Layout = () => {
    const { user, isAdmin, isLoading } = useContext(AuthContext);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const currentSidebarWidth = isCollapsed ? COLLAPSED_SIDEBAR_WIDTH : EXPANDED_SIDEBAR_WIDTH;
    const handleToggleSidebar = () => setIsCollapsed(prev => !prev);

    // --- ОБНОВЛЕННАЯ ЛОГИКА: SiteHeader для страниц /site/ и /product/ ---
    const siteHeaderMatch = location.pathname.match(/^\/(site|product)\/([^/]+)/);
    const shouldShowSiteHeader = !!siteHeaderMatch;
    const pathParam = shouldShowSiteHeader ? siteHeaderMatch[2] : null;

    // Футер не показываем в админке
    const shouldShowFooter = !isAdmin;

    if (isLoading) {
        return <div>Завантаження...</div>;
    }

    // Устанавливаем CSS переменную для ширины sidebar
    document.documentElement.style.setProperty('--sidebar-width', currentSidebarWidth);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {isAdmin ? (
                <AdminSidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
            ) : (
                <PlatformSidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
            )}

            {/* Основной контент с классом layout-content */}
            <div className="layout-content">
                {shouldShowSiteHeader && (
                    <SiteHeader 
                        pathParam={pathParam} 
                        sidebarWidth={currentSidebarWidth} 
                    />
                )}
                
                <main>
                    <Outlet />
                </main>
                
                {shouldShowFooter && <Footer />}
            </div>
        </div>
    );
};

export default Layout;