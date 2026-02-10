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
    const [showModal, setShowModal] = useState(false);

    if (!user) return null;

    return (
        <>
            <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <Link to={`/profile/${user.username}`} className="user-menu-item flex-1" title="Мій профіль">
                    <Avatar url={user.avatar_url} name={user.username} size={isCollapsed ? 40 : 36} />
                    
                    {!isCollapsed && (
                        <div className="user-menu-details">
                            <span className="user-name">{user.username}</span>
                            <span className="user-sub">{customSubtitle || user.email}</span>
                        </div>
                    )}
                </Link>

                {!isCollapsed && (
                    <button 
                        onClick={() => setShowModal(true)}
                        className="p-2 text-(--platform-text-secondary) hover:text-(--platform-danger) hover:bg-(--platform-hover-bg) rounded-md transition-colors"
                        title="Вийти"
                    >
                        <LogOut size={18} />
                    </button>
                )}
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