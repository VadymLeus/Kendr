// frontend/src/components/Layout.jsx
import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Footer from './Footer';
import SiteHeader from './SiteHeader';
import PlatformSidebar from './PlatformSidebar';

// КОНСТАНТИ: Ширина для різних станів бічної панелі
const EXPANDED_SIDEBAR_WIDTH = '220px';
const COLLAPSED_SIDEBAR_WIDTH = '80px';

const Layout = () => {
    // СТАН: Керування згорнутим/розгорнутим станом бічної панелі
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    // Логіка для визначення, чи є поточна сторінка сторінкою сайту
    const sitePageMatch = location.pathname.match(/^\/(site|edit-site|edit-shop|product)\/([^/]+)/);
    const isSiteSpecificPage = !!sitePageMatch;
    const pathParam = isSiteSpecificPage ? sitePageMatch[2] : null;

    // ПОТОЧНА ШИРИНА: Динамічно визначається на основі стану панелі
    const currentSidebarWidth = isCollapsed ? COLLAPSED_SIDEBAR_WIDTH : EXPANDED_SIDEBAR_WIDTH;

    // ОБРОБНИК: Функція для перемикання стану бічної панелі
    const handleToggleSidebar = () => setIsCollapsed(prev => !prev);

    return (
        <div>
            {/* Бічна панель з переданими пропсами для керування станом */}
            <PlatformSidebar 
                isCollapsed={isCollapsed} 
                onToggle={handleToggleSidebar} 
            />

            {/* Основний контент з динамічним відступом зліва */}
            <div style={{ 
                marginLeft: currentSidebarWidth, 
                transition: 'margin-left 0.3s ease' 
            }}>
                
                {/* Шапка сайту відображається лише на відповідних сторінках */}
                {isSiteSpecificPage && (
                    <SiteHeader 
                        pathParam={pathParam} 
                        sidebarWidth={currentSidebarWidth} // Передаємо поточну ширину
                    />
                )}

                {/* Головний вміст сторінки */}
                <main style={{ padding: '2rem' }}>
                    <Outlet />
                </main>
                
                {/* Футер відображається лише на сторінках платформи, а не сайту */}
                {!isSiteSpecificPage && <Footer />}
            </div>
        </div>
    );
};

export default Layout;