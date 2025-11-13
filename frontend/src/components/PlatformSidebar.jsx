// frontend/src/components/PlatformSidebar.jsx
import React, { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu';
import { CartContext } from '../features/cart/CartContext';
import { AuthContext } from '../features/auth/AuthContext';

const PlatformSidebar = ({ isCollapsed, onToggle }) => {
    const { cartItems } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleProtectedLinkClick = (e, path) => {
        if (!user) {
            e.preventDefault();
            navigate('/login');
        }
    };

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
        borderBottom: '1px solid var(--platform-border-color)',
        transition: 'padding 0.3s ease'
    };

    const navStyle = {
        flexGrow: 1,
        marginTop: '1.5rem'
    };

    const navLinkBaseStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        textDecoration: 'none',
        padding: '0.8rem 1rem',
        borderRadius: '6px',
        margin: '0 0.5rem 0.5rem',
        transition: 'background 0.2s, color 0.2s',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        color: 'var(--platform-text-secondary)'
    };

    const activeNavLinkStyle = {
        backgroundColor: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)',
        fontWeight: '500'
    };
    
    const toggleButtonStyle = {
        position: 'absolute',
        top: '75px',
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
        zIndex: 1300
    };

    const logoImageStyle = {
        height: '70px',
        maxHeight: '70px',
        width: '100%',
        maxWidth: isCollapsed ? '70px' : '180px',
        transition: 'all 0.3s ease',
        backgroundImage: 'var(--platform-logo-url)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        margin: '0 auto'
    };

    return (
        <div style={sidebarStyle}>
            <button onClick={onToggle} style={toggleButtonStyle}>
                {isCollapsed ? '»' : '«'}
            </button>

            <div style={logoContainerStyle}>
                <Link to="/">
                    <div style={logoImageStyle} />
                </Link>
            </div>

            <nav style={navStyle}>
                <NavLink 
                    to="/catalog" 
                    style={({ isActive }) => ({ 
                        ...navLinkBaseStyle, 
                        ...(isActive ? activeNavLinkStyle : {}) 
                    })}
                >
                    <span>{isCollapsed ? '📖' : 'Каталог'}</span>
                </NavLink>
                <NavLink 
                    to="/my-sites" 
                    onClick={(e) => handleProtectedLinkClick(e, '/my-sites')}
                    style={({ isActive }) => ({ 
                        ...navLinkBaseStyle, 
                        ...(isActive ? activeNavLinkStyle : {}) 
                    })}
                >
                    <span>{isCollapsed ? '💻' : 'Мої сайти'}</span>
                </NavLink>
                <NavLink 
                    to="/media-library" 
                    onClick={(e) => handleProtectedLinkClick(e, '/media-library')}
                    style={({ isActive }) => ({ 
                        ...navLinkBaseStyle, 
                        ...(isActive ? activeNavLinkStyle : {}) 
                    })}
                >
                    <span>{isCollapsed ? '🖼️' : 'Медіатека'}</span>
                </NavLink>
                <NavLink 
                    to="/favorites" 
                    onClick={(e) => handleProtectedLinkClick(e, '/favorites')}
                    style={({ isActive }) => ({ 
                        ...navLinkBaseStyle, 
                        ...(isActive ? activeNavLinkStyle : {}) 
                    })}
                >
                    <span>{isCollapsed ? '⭐' : 'Обране'}</span>
                </NavLink>
                <NavLink 
                    to="/create-site" 
                    onClick={(e) => handleProtectedLinkClick(e, '/create-site')}
                    style={({ isActive }) => ({ 
                        ...navLinkBaseStyle, 
                        ...(isActive ? activeNavLinkStyle : {}) 
                    })}
                >
                    <span>{isCollapsed ? '➕' : 'Створити сайт'}</span>
                </NavLink>
                {user && (
                    <NavLink 
                        to="/cart" 
                        style={({ isActive }) => ({ 
                            ...navLinkBaseStyle, 
                            ...(isActive ? activeNavLinkStyle : {}) 
                        })}
                    >
                        <span>{isCollapsed ? `🛒` : `Кошик (${cartItems.length})`}</span>
                    </NavLink>
                )}
                <NavLink 
                    to="/support" 
                    style={({ isActive }) => ({ 
                        ...navLinkBaseStyle, 
                        ...(isActive ? activeNavLinkStyle : {}) 
                    })}
                >
                    <span>{isCollapsed ? '❓' : 'Підтримка'}</span>
                </NavLink>
            </nav>

            <div style={{ borderTop: '1px solid var(--platform-border-color)', padding: '1rem 0' }}>
                <UserMenu isCollapsed={isCollapsed} />
            </div>
        </div>
    );
};

export default PlatformSidebar;