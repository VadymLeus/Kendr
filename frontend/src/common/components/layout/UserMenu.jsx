// frontend/src/common/components/layout/UserMenu.jsx
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import { IconUser } from '../ui/Icons';

const API_URL = 'http://localhost:5000';

const getAvatarUrl = (url) => {
    if (!url) return 'https://placehold.co/100';
    if (url.startsWith('http') || url.startsWith('https')) {
        return url;
    }
    return `${API_URL}${url}`;
};

const UserMenu = ({ isCollapsed }) => {
    const { user, logout, isAdmin } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const linkStyles = { 
        textDecoration: 'none', 
        color: 'var(--platform-text-secondary)', 
        fontWeight: '500', 
        display: 'block', 
        textAlign: 'center', 
        padding: '0.5rem 0' 
    };
    
    const avatarStyles = { 
        height: '50px', 
        width: '50px', 
        borderRadius: '50%', 
        objectFit: 'cover', 
        cursor: 'pointer', 
        border: '3px solid var(--platform-accent)' 
    };
    
    const dropdownMenuStyles = { 
        position: 'absolute', 
        bottom: '70px', 
        right: isCollapsed ? '-130px' : 0,
        background: 'var(--platform-sidebar-bg)', 
        border: '1px solid var(--platform-border-color)', 
        borderRadius: '8px', 
        boxShadow: '0 -4px 8px rgba(0,0,0,0.5)', 
        minWidth: '200px', 
        zIndex: 1200, 
        padding: '0.5rem 0' 
    };
    
    const dropdownHeaderStyle = {
        padding: '0.75rem 1rem', 
        borderBottom: '1px solid var(--platform-border-color)',
        color: 'var(--platform-text-primary)'
    };
    
    const dropdownEmailStyle = { 
        color: 'var(--platform-text-secondary)'
    };
    
    const dropdownItemStyles = { 
        display: 'block', 
        padding: '0.75rem 1rem', 
        color: 'var(--platform-text-secondary)', 
        textDecoration: 'none', 
        cursor: 'pointer', 
        background: 'none', 
        border: 'none', 
        width: '100%', 
        textAlign: 'left',
        transition: 'all 0.2s ease'
    };
    
    const dropdownItemHoverStyle = {
        color: 'var(--platform-text-primary)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)'
    };
    
    const dropdownDividerStyle = { 
        margin: '0.25rem 0', 
        border: 'none', 
        borderTop: '1px solid var(--platform-border-color)' 
    };
    
    const logoutButtonStyle = { 
        ...dropdownItemStyles, 
        color: 'var(--platform-danger)' 
    };
    
    const userBlockStyle = { 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '1rem', 
        position: 'relative' 
    };

    const handleItemClick = (callback) => {
        setIsDropdownOpen(false);
        if (callback) callback();
    };

    const handleItemMouseEnter = (e) => {
        Object.assign(e.target.style, dropdownItemHoverStyle);
    };

    const handleItemMouseLeave = (e) => {
        Object.assign(e.target.style, dropdownItemStyles);
    };

    return (
        <div style={userBlockStyle}>
            {user ? (
                <div ref={dropdownRef}>
                    <img 
                        src={getAvatarUrl(user.avatar_url)} 
                        alt={`Аватар ${user.username}`}
                        onClick={() => setIsDropdownOpen(prev => !prev)}
                        style={avatarStyles} 
                    />
                    {isDropdownOpen && (
                        <div style={dropdownMenuStyles}>
                            <div style={dropdownHeaderStyle}>
                                <strong style={{ display: 'block' }}>{user.username}</strong>
                                <small style={dropdownEmailStyle}>{user.email}</small>
                            </div>
                            <Link 
                                to={`/profile/${user.username}`} 
                                style={dropdownItemStyles}
                                onMouseEnter={handleItemMouseEnter}
                                onMouseLeave={handleItemMouseLeave}
                                onClick={() => handleItemClick()}
                            >
                                Мій профіль
                            </Link>
                            <Link 
                                to="/settings" 
                                style={dropdownItemStyles}
                                onMouseEnter={handleItemMouseEnter}
                                onMouseLeave={handleItemMouseLeave}
                                onClick={() => handleItemClick()}
                            >
                                Налаштування
                            </Link>
                            
                            {!isAdmin && (
                                <Link 
                                    to="/my-sites" 
                                    style={dropdownItemStyles}
                                    onMouseEnter={handleItemMouseEnter}
                                    onMouseLeave={handleItemMouseLeave}
                                    onClick={() => handleItemClick()}
                                >
                                    Мої Сайти
                                </Link>
                            )}

                            <hr style={dropdownDividerStyle}/>
                            <div 
                                onClick={() => handleItemClick(handleLogout)} 
                                style={logoutButtonStyle}
                                onMouseEnter={handleItemMouseEnter}
                                onMouseLeave={handleItemMouseLeave}
                            >
                                Вийти
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <Link 
                    to="/login" 
                    style={{
                        ...linkStyles,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: isCollapsed ? '0' : '8px',
                        padding: '8px 16px',
                        backgroundColor: 'var(--platform-card-bg)',
                        border: '1px solid var(--platform-border-color)',
                        borderRadius: '8px',
                        width: isCollapsed ? '40px' : 'auto',
                        height: isCollapsed ? '40px' : 'auto'
                    }}
                    title="Авторизація"
                >
                    <IconUser size={18} />
                    {!isCollapsed && <span>Авторизація</span>}
                </Link>
            )}
        </div>
    );
};

export default UserMenu;