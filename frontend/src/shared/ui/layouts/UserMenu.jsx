// frontend/src/shared/ui/layouts/UserMenu.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import Avatar from '../elements/Avatar';
import ConfirmModal from '../complex/ConfirmModal';
import { LogOut, Settings } from 'lucide-react';

const UserMenu = ({ isCollapsed, customSubtitle = null }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    if (!user) return null;
    return (
        <>
            <div className={`w-full ${isCollapsed ? 'flex justify-center' : ''}`}>
                <div className={`flex items-center gap-3 w-full ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <Link 
                        to={`/profile/${user.username}`} 
                        className="flex items-center gap-3 flex-1 min-w-0 group rounded-lg hover:bg-(--platform-hover-bg) transition-colors p-1 -ml-1" 
                        title="Мій профіль"
                    >
                        <Avatar url={user.avatar_url} name={user.username} size={isCollapsed ? 36 : 38} />
                        {!isCollapsed && (
                            <div className="flex flex-col truncate">
                                <span className="text-sm font-medium text-(--platform-text-primary) truncate group-hover:text-(--platform-accent) transition-colors">
                                    {user.username}
                                </span>
                                <span className="text-xs text-(--platform-text-secondary) truncate opacity-80">
                                    {customSubtitle || user.email}
                                </span>
                            </div>
                        )}
                    </Link>
                    {!isCollapsed && (
                        <div className="flex flex-col gap-1 pl-2 border-l border-(--platform-border-color)">
                            <button 
                                onClick={() => navigate('/settings')}
                                className="p-1.5 text-(--platform-text-secondary) hover:text-(--platform-accent) hover:bg-(--platform-hover-bg) rounded-md transition-all"
                                title="Налаштування"
                            >
                                <Settings size={16} />
                            </button>
                            <button 
                                onClick={() => setShowModal(true)}
                                className="p-1.5 text-(--platform-text-secondary) hover:text-(--platform-danger) hover:bg-(--platform-hover-bg) rounded-md transition-all"
                                title="Вийти"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmModal 
                isOpen={showModal}
                title="Вихід"
                message="Ви впевнені, що хочете вийти?"
                confirmLabel="Вийти"
                onConfirm={() => { logout(); navigate('/login'); setShowModal(false); }}
                onCancel={() => setShowModal(false)}
                type="danger"
            />
        </>
    );
};

export default UserMenu;