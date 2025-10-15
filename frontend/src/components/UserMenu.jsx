// frontend/src/components/UserMenu.jsx
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../features/auth/AuthContext';

const API_URL = 'http://localhost:5000';

// Додано проп `isCollapsed` для адаптації меню до стану бічної панелі
const UserMenu = ({ isCollapsed }) => {
    const { user, logout } = useContext(AuthContext);
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

    // Стилі
    const linkStyles = { 
        textDecoration: 'none', 
        color: '#cbd5e0', 
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
        border: '2px solid #4299e1' 
    };
    
    // СТИЛЬ: Позиціонування випадаючого меню адаптується до стану бічної панелі
    const dropdownMenuStyles = { 
        position: 'absolute', 
        bottom: '70px', 
        right: isCollapsed ? '-130px' : 0, // Динамічне позиціонування
        background: '#2d3748', 
        border: '1px solid #4a5568', 
        borderRadius: '8px', 
        boxShadow: '0 -4px 8px rgba(0,0,0,0.5)', 
        minWidth: '200px', 
        zIndex: 1200, 
        padding: '0.5rem 0' 
    };
    
    const dropdownItemStyles = { 
        display: 'block', 
        padding: '0.75rem 1rem', 
        color: '#e2e8f0', 
        textDecoration: 'none', 
        cursor: 'pointer', 
        background: 'none', 
        border: 'none', 
        width: '100%', 
        textAlign: 'left' 
    };
    
    // СТИЛЬ: Вертикальне розташування елементів у блоці користувача
    const userBlockStyle = { 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '1rem', 
        position: 'relative' 
    };

    return (
        <div style={userBlockStyle}>
            {user ? (
                <div ref={dropdownRef}>
                    <img 
                        src={`${API_URL}${user.avatar_url}`} 
                        alt={`Аватар ${user.username}`}
                        onClick={() => setIsDropdownOpen(prev => !prev)}
                        style={avatarStyles} 
                    />
                    {isDropdownOpen && (
                        <div style={dropdownMenuStyles}>
                            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #4a5568' }}>
                                <strong style={{ display: 'block', color: 'white' }}>{user.username}</strong>
                                <small style={{ color: '#a0aec0' }}>{user.email}</small>
                            </div>
                            <Link to={`/profile/${user.username}`} onClick={() => setIsDropdownOpen(false)} style={dropdownItemStyles}>Мій профіль</Link>
                            <Link to="/settings" onClick={() => setIsDropdownOpen(false)} style={dropdownItemStyles}>Налаштування</Link>
                            <Link to="/my-sites" onClick={() => setIsDropdownOpen(false)} style={dropdownItemStyles}>Мої Сайти</Link>
                            <hr style={{ margin: '0.25rem 0', border: 'none', borderTop: '1px solid #4a5568' }}/>
                            <div onClick={handleLogout} style={{...dropdownItemStyles, color: '#f56565' }}>Вийти</div>
                        </div>
                    )}
                </div>
            ) : (
                // АДАПТИВНИЙ РЕНДЕРИНГ: Для згорнутого та розгорнутого стану
                isCollapsed ? (
                    // Згорнутий стан: лише перші літери
                    <>
                        <Link to="/login" style={linkStyles}>В</Link>
                        <Link to="/register" style={linkStyles}>Р</Link>
                    </>
                ) : (
                    // Розгорнутий стан: повний текст
                    <>
                        <Link to="/login" style={linkStyles}>Увійти</Link>
                        <Link to="/register" style={linkStyles}>Реєстрація</Link>
                    </>
                )
            )}
        </div>
    );
};

export default UserMenu;