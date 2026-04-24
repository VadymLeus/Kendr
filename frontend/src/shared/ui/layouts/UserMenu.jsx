// frontend/src/shared/ui/layouts/UserMenu.jsx
import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
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
    const isStaff = user.role === 'admin' || user.role === 'moderator';
    const profileLink = isStaff ? '/settings' : `/profile/${user.slug}`;
    const profileTitle = isStaff ? 'Налаштування' : 'Мій профіль';
    return (
        <>
            <div className="w-full">
                <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'justify-between gap-1 sm:gap-2'}`}>
                    <Link 
                        to={profileLink} 
                        className={`flex items-center group rounded-lg hover:bg-(--platform-hover-bg) transition-colors ${
                            isCollapsed ? 'justify-center p-2' : 'justify-center sm:justify-start gap-3 flex-1 min-w-0 p-2'
                        }`} 
                        title={profileTitle}
                    >
                        <Avatar url={user.avatar_url} name={user.username} size={isCollapsed ? 36 : 38} />
                        {!isCollapsed && (
                            <div className="hidden sm:flex flex-col truncate">
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
                        <div className="flex flex-row sm:flex-col items-center gap-2 sm:gap-1 pr-2 sm:pr-0 sm:pl-1 sm:border-l sm:border-(--platform-border-color)">
                            <button 
                                onClick={() => navigate('/settings')}
                                className="flex items-center justify-center p-2.5 sm:p-1.5 text-(--platform-text-secondary) hover:text-(--platform-accent) bg-(--platform-card-bg) sm:bg-transparent border border-(--platform-border-color) sm:border-transparent rounded-lg sm:rounded-md transition-all sm:hover:bg-(--platform-hover-bg)"
                                title="Налаштування"
                            >
                                <Settings className="w-5 h-5 sm:w-4 sm:h-4" />
                            </button>
                            <button 
                                onClick={() => setShowModal(true)}
                                className="flex items-center justify-center p-2.5 sm:p-1.5 text-(--platform-text-secondary) hover:text-(--platform-danger) bg-(--platform-card-bg) sm:bg-transparent border border-(--platform-border-color) sm:border-transparent rounded-lg sm:rounded-md transition-all sm:hover:bg-(--platform-hover-bg)"
                                title="Вийти"
                            >
                                <LogOut className="w-5 h-5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {typeof document !== 'undefined' && createPortal(
                <ConfirmModal 
                    isOpen={showModal}
                    title="Вихід"
                    message="Ви впевнені, що хочете вийти?"
                    confirmLabel="Вийти"
                    onConfirm={() => { logout(); navigate('/login'); setShowModal(false); }}
                    onCancel={() => setShowModal(false)}
                    type="danger"
                />,
                document.body
            )}
        </>
    );
};

export default UserMenu;