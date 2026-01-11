// frontend/src/shared/ui/layouts/PlatformSidebar.jsx
import React, { useContext, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu';
import { CartContext } from '../../../app/providers/CartContext';
import { AuthContext } from '../../../app/providers/AuthContext';
import ConfirmModal from '../complex/ConfirmModal';
import { Store, Layout, FileText, ShoppingCart, HelpCircle, ChevronLeft, ChevronRight, User, Settings, LogOut } from 'lucide-react';

const PlatformSidebar = ({ isCollapsed, onToggle }) => {
    const { cartItems } = useContext(CartContext);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleProtectedLinkClick = (e, path) => {
        if (!user) {
            e.preventDefault();
            navigate('/login');
        }
    };

    const handleLogoutClick = (e) => {
        e.preventDefault();
        setIsLogoutModalOpen(true);
    };

    const handleConfirmLogout = () => {
        logout();
        navigate('/login');
        setIsLogoutModalOpen(false);
    };

    const sidebarWidth = isCollapsed ? '80px' : '280px'; 

    const sidebarStyle = {
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: sidebarWidth,
        background: 'var(--platform-sidebar-bg)',
        color: 'var(--platform-text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 2000, 
        transition: 'width 0.3s cubic-bezier(0.2, 0, 0, 1)',
        boxSizing: 'border-box',
        borderRight: '1px solid var(--platform-border-color)',
        overflow: 'visible' 
    };

    const logoContainerStyle = {
        height: '90px', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid var(--platform-border-color)',
        padding: '0', 
        position: 'relative',
        flexShrink: 0
    };

    const logoImageStyle = {
        height: '70px', 
        width: '70px',
        transition: 'all 0.3s ease',
        backgroundImage: 'var(--platform-logo-url)',
        backgroundSize: 'contain', 
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
    };

    const toggleButtonStyle = {
        position: 'absolute',
        right: '-16px', 
        top: '100%',    
        marginTop: '-16px', 
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'var(--platform-card-bg)',
        border: '1px solid var(--platform-border-color)',
        color: 'var(--platform-text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2100, 
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        transition: 'all 0.2s ease',
        outline: 'none'
    };

    const navContainerStyle = {
        flexGrow: 1,
        padding: '24px 12px', 
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    };

    const groupWrapperStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    };

    const separatorStyle = {
        height: '1px',
        background: 'var(--platform-border-color)',
        margin: '4px 8px',
        opacity: 0.5
    };

    const sidebarStyles = `
        .sidebar-link {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
            padding: 12px 16px;
            border-radius: 8px;
            transition: all 0.2s ease;
            color: var(--platform-text-secondary);
            font-weight: 500;
            font-size: 0.95rem;
            white-space: nowrap;
            overflow: hidden;
            border: 1px solid transparent;
            background: transparent;
            outline: none !important;
            position: relative;
            cursor: pointer;
        }

        .sidebar-link:not(.logout-link):hover {
            border-color: var(--platform-accent);
            color: var(--platform-accent);
            background: var(--platform-card-bg);
            text-decoration: none;
        }

        .sidebar-link.active {
            background-color: var(--platform-accent);
            color: var(--platform-accent-text);
            border-color: var(--platform-accent);
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .sidebar-link.logout-link {
            border: 1px solid var(--platform-danger) !important;
            color: var(--platform-text-secondary);
            background: transparent !important;
            box-shadow: none !important;
            text-decoration: none !important;
        }

        .sidebar-link.logout-link:hover {
            border-color: var(--platform-danger) !important;
            color: var(--platform-danger) !important;
            background: rgba(229, 62, 62, 0.05) !important;
            text-decoration: none !important;
        }

        .sidebar-link:focus, .sidebar-link:active {
            outline: none !important;
            box-shadow: none; 
        }
        
        .sidebar-create-btn {
            background-color: var(--platform-accent);
            color: var(--platform-accent-text) !important;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: 1px solid var(--platform-accent);
            justify-content: center;
        }

        .sidebar-create-btn:hover {
            background-color: var(--platform-accent-hover) !important;
            transform: translateY(-1px);
            border-color: var(--platform-accent-hover);
            color: var(--platform-accent-text) !important;
        }
        
        .sidebar-create-btn.active {
            background-color: var(--platform-accent-hover);
        }
    `;

    const SidebarLink = ({ to, icon: Icon, label, protectedLink, count, isCreateButton = false, onClick, className = '' }) => {
        const finalClassName = `${isCreateButton ? 'sidebar-link sidebar-create-btn' : 'sidebar-link'} ${className}`;
        
        const style = {
            justifyContent: isCollapsed ? 'center' : (isCreateButton ? 'center' : 'flex-start')
        };

        const handleClick = (e) => {
            if (onClick) {
                onClick(e);
            } else if (protectedLink) {
                handleProtectedLinkClick(e, to);
            }
        };

        return (
            <NavLink 
                to={to} 
                className={finalClassName}
                style={style}
                onClick={handleClick}
                title={isCollapsed ? label : ''}
            >
                {isCreateButton ? (
                    isCollapsed ? (
                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </div>
                    ) : null
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                        <Icon size={20} />
                    </div>
                )}

                {!isCollapsed && (
                    <span style={{ opacity: isCollapsed ? 0 : 1, transition: 'opacity 0.2s' }}>
                        {label} {count !== undefined && `(${count})`}
                    </span>
                )}
            </NavLink>
        );
    };

    return (
        <div style={sidebarStyle} className="custom-scrollbar">
            <style>{sidebarStyles}</style>

            <div style={logoContainerStyle}>
                <Link to="/" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                    <div style={logoImageStyle} />
                </Link>
                
                <button 
                    onClick={onToggle} 
                    style={toggleButtonStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--platform-accent)';
                        e.currentTarget.style.borderColor = 'var(--platform-accent)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--platform-text-secondary)';
                        e.currentTarget.style.borderColor = 'var(--platform-border-color)';
                    }}
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <div style={navContainerStyle} className="custom-scrollbar">
                
                <div style={groupWrapperStyle}>
                    <SidebarLink 
                        to="/create-site" 
                        icon={FileText} 
                        label="Створити сайт" 
                        protectedLink 
                        isCreateButton={true} 
                    />
                </div>

                <div style={separatorStyle}></div>
                <div style={groupWrapperStyle}>
                    <SidebarLink to="/my-sites" icon={Layout} label="Мої сайти" protectedLink />
                    <SidebarLink to="/media-library" icon={FileText} label="Медіатека" protectedLink />
                </div>

                <div style={separatorStyle}></div>

                <div style={groupWrapperStyle}>
                    <SidebarLink to="/catalog" icon={Store} label="Каталог сайтів" />
                    {user && (
                        <SidebarLink to="/cart" icon={ShoppingCart} label="Кошик" count={cartItems.length} />
                    )}
                </div>

                <div style={separatorStyle}></div>

                <div style={groupWrapperStyle}>
                    <SidebarLink to="/support" icon={HelpCircle} label="Підтримка" />
                    {user && (
                        <SidebarLink to="/settings" icon={Settings} label="Налаштування" />
                    )}
                    
                    {!user && (
                        <SidebarLink to="/login" icon={User} label="Авторизація" />
                    )}
                </div>

                {user && (
                    <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                        <SidebarLink 
                            to="#" 
                            icon={LogOut} 
                            label="Вийти" 
                            onClick={handleLogoutClick}
                            isCreateButton={false}
                            className="logout-link"
                        />
                    </div>
                )}
            </div>

            {user && (
                <div style={{ 
                    borderTop: '1px solid var(--platform-border-color)', 
                    background: 'var(--platform-sidebar-bg)',
                    flexShrink: 0 
                }}>
                    <UserMenu isCollapsed={isCollapsed} />
                </div>
            )}

            <ConfirmModal 
                isOpen={isLogoutModalOpen}
                title="Вихід з акаунту"
                message="Ви впевнені, що хочете вийти зі свого акаунту?"
                confirmLabel="Вийти"
                cancelLabel="Скасувати"
                onConfirm={handleConfirmLogout}
                onCancel={() => setIsLogoutModalOpen(false)}
                type="danger"
            />
        </div>
    );
};

export default PlatformSidebar;