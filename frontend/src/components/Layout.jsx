// frontend/src/components/Layout.jsx
import React, { useState, useContext } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../features/auth/AuthContext';
import PlatformSidebar from './PlatformSidebar';
import AdminSidebar from '../admin/AdminSidebar';
import SiteHeader from './SiteHeader';
import Footer from './Footer';

const Layout = () => {
    const { user, isAdmin, isLoading } = useContext(AuthContext);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const currentSidebarWidth = isCollapsed ? '80px' : '220px';
    const handleToggleSidebar = () => setIsCollapsed(prev => !prev);

    const sitePageMatch = location.pathname.match(/^\/site\/([^/]+)/);
    const isSiteViewingPage = !!sitePageMatch;
    const pathParam = isSiteViewingPage ? sitePageMatch[1] : null;

    const shouldShowFooter = !isAdmin && !isSiteViewingPage;

    if (isLoading) {
        return <div>Завантаження...</div>;
    }

    return (
        <div>
            {isAdmin ? (
                <AdminSidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
            ) : (
                <PlatformSidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
            )}

            <div style={{ 
                marginLeft: currentSidebarWidth, 
                transition: 'margin-left 0.3s ease' 
            }}>
                {isSiteViewingPage && (
                    <SiteHeader 
                        pathParam={pathParam} 
                        sidebarWidth={currentSidebarWidth}
                    />
                )}
                <main style={{ padding: '2rem', minHeight: 'calc(100vh - 150px)' }}>
                    <Outlet />
                </main>
                {shouldShowFooter && <Footer />}
            </div>
        </div>
    );
};

export default Layout;