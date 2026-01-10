// frontend/src/shared/ui/layouts/UserMenu.jsx
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import Avatar from '../elements/Avatar';

const UserMenu = ({ isCollapsed }) => {
    const { user } = useContext(AuthContext);
    const [isHovered, setIsHovered] = useState(false);

    const containerStyle = {
        padding: '12px 16px', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: '12px',
        transition: 'all 0.3s ease',
        minHeight: '66px'
    };

    const infoStyle = {
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    };

    const nameStyle = {
        fontSize: '1.0rem',
        fontWeight: '600',
        color: 'var(--platform-text-primary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    };

    const emailStyle = {
        fontSize: '0.7rem',
        color: 'var(--platform-text-secondary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        opacity: 0.8
    };

    if (isCollapsed) {
        return (
            <div style={containerStyle}>
                <Link 
                    to={`/profile/${user.username}`} 
                    title="Мій профіль"
                    style={{ display: 'flex', justifyContent: 'center' }}
                >
                    <Avatar 
                        url={user.avatar_url} 
                        name={user.username} 
                        size={42} 
                    />
                </Link>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <Link 
                to={`/profile/${user.username}`} 
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    textDecoration: 'none', 
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden' 
                }}
            >
                <Avatar 
                    url={user.avatar_url} 
                    name={user.username} 
                    size={42} 
                    className={isHovered ? 'ring-2 ring-accent' : ''}
                />
                <div style={infoStyle}>
                    <div style={nameStyle}>{user.username}</div>
                    <div style={emailStyle} title={user.email}>{user.email}</div>
                </div>
            </Link>
        </div>
    );
};

export default UserMenu;