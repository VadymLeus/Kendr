// frontend/src/modules/admin/components/AdminSidebar.jsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import UserMenu from '../../../shared/ui/layouts/UserMenu';

const AdminSidebar = ({ isCollapsed, onToggle }) => {
    const sidebarStyle = {
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: isCollapsed ? '80px' : '220px',
        background: 'var(--platform-sidebar-bg)',
        color: 'var(--platform-text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1100,
        transition: 'width 0.3s ease',
        boxSizing: 'border-box',
        borderRight: '1px solid var(--platform-border-color)'
    };

    const logoContainerStyle = {
        padding: '1.5rem 0',
        textAlign: 'center',
        borderBottom: '1px solid var(--platform-border-color)'
    };

    const navStyle = {
        flexGrow: 1,
        marginTop: '1.5rem'
    };

    const toggleButtonStyle = {
        position: 'absolute',
        top: '105px', 
        right: '-15px',
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        background: 'var(--platform-sidebar-bg)',
        border: '1px solid var(--platform-border-color)',
        color: 'var(--platform-text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    };

    const navLinkBaseClass = `flex items-center gap-4 text-decoration-none py-3 px-4 rounded-md mx-2 mb-2 transition-colors duration-200 ${isCollapsed ? 'justify-center' : 'justify-start'} text-[var(--platform-text-secondary)] hover:bg-[rgba(0,0,0,0.05)] hover:text-[var(--platform-text-primary)]`;

    const activeStyle = {
        backgroundColor: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)',
        fontWeight: '500'
    };
    
    const logoImageStyle = {
        height: '70px',
        width: isCollapsed ? '70px' : 'auto',
        maxWidth: '100%',
        objectFit: 'contain',
        transition: 'all 0.3s ease'
    };

    return (
        <div style={sidebarStyle}>
            <button onClick={onToggle} style={toggleButtonStyle} title={isCollapsed ? "Розгорнути меню" : "Згорнути меню"}>
                {isCollapsed ? '»' : '«'}
            </button>

            <div style={logoContainerStyle}>
                <Link to="/admin">
                    <img 
                        src="/admin.webp" 
                        alt="Admin Logo" 
                        style={logoImageStyle} 
                    />
                </Link>
            </div>

            <nav style={navStyle}>
                <NavLink 
                    to="/admin" 
                    end 
                    className={navLinkBaseClass}
                    style={({ isActive }) => isActive ? activeStyle : undefined}
                >
                    <span>{isCollapsed ? '📊' : 'Всі сайти'}</span>
                </NavLink>
                
                <NavLink 
                    to="/admin/support" 
                    className={navLinkBaseClass}
                    style={({ isActive }) => isActive ? activeStyle : undefined}
                >
                    <span>{isCollapsed ? '📩' : 'Підтримка'}</span>
                </NavLink>
                
                <NavLink 
                    to="/admin/users" 
                    className={navLinkBaseClass}
                    style={({ isActive }) => isActive ? activeStyle : undefined}
                >
                    <span>{isCollapsed ? '👥' : 'Користувачі'}</span>
                </NavLink>
                
                <NavLink 
                    to="/admin/templates" 
                    className={navLinkBaseClass}
                    style={({ isActive }) => isActive ? activeStyle : undefined}
                >
                    <span>{isCollapsed ? '🎨' : 'Шаблони'}</span>
                </NavLink>
                
                <NavLink 
                    to="/admin/analytics" 
                    className={navLinkBaseClass}
                    style={({ isActive }) => isActive ? activeStyle : undefined}
                >
                    <span>{isCollapsed ? '📈' : 'Аналітика'}</span>
                </NavLink>
            </nav>

            <div style={{ borderTop: '1px solid var(--platform-border-color)', padding: '1rem 0' }}>
                <UserMenu isCollapsed={isCollapsed} />
            </div>
        </div>
    );
};

export default AdminSidebar;