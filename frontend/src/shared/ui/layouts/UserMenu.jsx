// frontend/src/shared/ui/layouts/UserMenu.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import Avatar from '../elements/Avatar';
import ConfirmModal from '../complex/ConfirmModal';
import { LogOut } from 'lucide-react';

const UserMenu = ({ isCollapsed, customSubtitle = null }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    if (!user) return null;
    const handleLogoutClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLogoutModalOpen(true);
    };

    const handleConfirmLogout = () => {
        logout();
        navigate('/login');
        setIsLogoutModalOpen(false);
    };

    const styles = {
        container: {
            display: 'flex', 
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            width: '100%'
        },
        userBlock: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '12px',
            textDecoration: 'none',
            padding: '8px',
            borderRadius: '8px',
            transition: 'background 0.2s',
            cursor: 'pointer',
            flex: 1,
            minWidth: 0 
        },
        userInfo: {
            display: isCollapsed ? 'none' : 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            marginRight: '8px'
        }
    };

    const cssStyles = `
        .user-block-hover:hover {
            background: var(--platform-card-bg);
        }
        .logout-mini-btn {
            color: var(--platform-text-secondary);
            padding: 6px;
            border-radius: 6px;
            transition: all 0.2s;
            background: transparent;
            border: none;
            cursor: pointer;
            flex-shrink: 0;
        }
        .logout-mini-btn:hover {
            color: var(--platform-danger);
            background: rgba(229, 62, 62, 0.1);
        }
    `;

    return (
        <>
            <style>{cssStyles}</style>
            <div style={styles.container}>
                <Link 
                    to={`/profile/${user.username}`} 
                    style={styles.userBlock} 
                    className="user-block-hover"
                    title="Мій профіль"
                >
                    <Avatar 
                        url={user.avatar_url} 
                        name={user.username} 
                        size={isCollapsed ? 40 : 36} 
                    />
                    
                    <div style={styles.userInfo}>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--platform-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.username}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--platform-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {customSubtitle || user.email}
                        </div>
                    </div>
                </Link>

                {!isCollapsed && (
                    <button 
                        onClick={handleLogoutClick}
                        className="logout-mini-btn"
                        title="Вийти"
                    >
                        <LogOut size={18} />
                    </button>
                )}
            </div>

            <ConfirmModal 
                isOpen={isLogoutModalOpen}
                title="Вихід з акаунту"
                message="Ви впевнені, що хочете вийти з акаунту?"
                confirmLabel="Вийти"
                cancelLabel="Скасувати"
                onConfirm={handleConfirmLogout}
                onCancel={() => setIsLogoutModalOpen(false)}
                type="danger"
            />
        </>
    );
};

export default UserMenu;