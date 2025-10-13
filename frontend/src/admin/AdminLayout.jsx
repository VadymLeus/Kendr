// frontend/src/admin/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar'; // Імпортуємо бічну панель

// Виносимо ширину в константи для кращої читабельності
const EXPANDED_SIDEBAR_WIDTH = '220px';
const COLLAPSED_SIDEBAR_WIDTH = '80px';

const AdminLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false); // Стан панелі (згорнута/розгорнута)

    const currentSidebarWidth = isCollapsed ? COLLAPSED_SIDEBAR_WIDTH : EXPANDED_SIDEBAR_WIDTH;

    const handleToggleSidebar = () => setIsCollapsed(prev => !prev);

    return (
        <div style={{ background: '#f7fafc', minHeight: '100vh' }}>
            {/* Використовуємо компонент бічної панелі */}
            <AdminSidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />

            {/* Основний контент тепер має відступ, що дорівнює ширині панелі */}
            <div style={{ marginLeft: currentSidebarWidth, transition: 'margin-left 0.3s ease' }}>
                <main style={{ padding: '2rem' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;