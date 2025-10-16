// frontend/src/admin/AdminSidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import UserMenu from '../components/UserMenu';

const AdminSidebar = ({ isCollapsed, onToggle }) => {
    const sidebarStyle = {
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: isCollapsed ? '80px' : '220px',
        background: '#0e0d0d',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1100,
        transition: 'width 0.3s ease',
        boxSizing: 'border-box',
        borderRight: '2px solid #e53e3e'
    };

    const logoContainerStyle = {
        padding: '1rem 0',
        textAlign: 'center',
        borderBottom: '1px solid #4a5568'
    };

    const navStyle = {
        flexGrow: 1,
        marginTop: '1.5rem'
    };

    const navLinkStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        color: '#cbd5e0',
        textDecoration: 'none',
        padding: '1rem',
        borderRadius: '8px',
        margin: '0 0.5rem 0.5rem',
        transition: 'background 0.2s, color 0.2s',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
    };
    
    const toggleButtonStyle = {
        position: 'absolute',
        top: '87px',
        right: '-15px',
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        background: '#2d3748',
        border: '1px solid #e53e3e',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300
    };

    return (
        <div style={sidebarStyle}>
            <button onClick={onToggle} style={toggleButtonStyle}>
                {isCollapsed ? '»' : '«'}
            </button>

            <div style={logoContainerStyle}>
                <Link to="/admin">
                    <img src="/admin.webp" alt="Admin Logo" style={{ height: '70px', transition: 'height 0.3s ease' }} />
                </Link>
            </div>

            <nav style={navStyle}>
                <Link to="/admin" style={navLinkStyle}>
                    <span>{isCollapsed ? '📊' : 'Усі сайти'}</span>
                </Link>
                <Link to="/admin/support" style={navLinkStyle}>
                    <span>{isCollapsed ? '📩' : 'Підтримка'}</span>
                </Link>
                <Link to="/" style={navLinkStyle}>
                    <span>{isCollapsed ? '🏠' : 'На головний сайт'}</span>
                </Link>
            </nav>

            <div style={{ borderTop: '1px solid #4a5568', padding: '1rem 0' }}>
                <UserMenu isCollapsed={isCollapsed} />
            </div>
        </div>
    );
};

export default AdminSidebar;