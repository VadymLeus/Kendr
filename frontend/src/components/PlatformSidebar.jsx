// frontend/src/components/PlatformSidebar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
        background: '#242060',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1100,
        transition: 'width 0.3s ease',
        boxSizing: 'border-box'
    };

    const logoContainerStyle = {
        padding: '1rem 0',
        textAlign: 'center',
        borderBottom: '1px solid #5a684aff'
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
        border: '1px solid #4a5568',
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
                <Link to="/">
                    <img 
                        src="/icon.webp" 
                        alt="Kendr Logo" 
                        style={{ 
                            height: '70px', 
                            transition: 'height 0.3s ease' 
                        }} 
                    />
                </Link>
            </div>

            <nav style={navStyle}>
                <Link to="/catalog" style={navLinkStyle}>
                    <span>{isCollapsed ? '📖' : 'Каталог'}</span>
                </Link>
                <Link to="/my-sites" style={navLinkStyle} onClick={(e) => handleProtectedLinkClick(e, '/my-sites')}>
                    <span>{isCollapsed ? '💻' : 'Мої сайти'}</span>
                </Link>
                <Link to="/favorites" style={navLinkStyle} onClick={(e) => handleProtectedLinkClick(e, '/favorites')}>
                    <span>{isCollapsed ? '⭐' : 'Обране'}</span>
                </Link>
                <Link to="/create-site" style={navLinkStyle} onClick={(e) => handleProtectedLinkClick(e, '/create-site')}>
                    <span>{isCollapsed ? '➕' : 'Створити сайт'}</span>
                </Link>
                <Link to="/support" style={navLinkStyle}>
                    <span>{isCollapsed ? '❓' : 'Підтримка'}</span>
                </Link>
                {user && (
                    <Link to="/cart" style={navLinkStyle}>
                        <span>{isCollapsed ? `🛒` : `Кошик (${cartItems.length})`}</span>
                    </Link>
                )}
            </nav>

            <div style={{ borderTop: '1px solid #4a5568', padding: '1rem 0' }}>
                <UserMenu isCollapsed={isCollapsed} />
            </div>
        </div>
    );
};

export default PlatformSidebar;