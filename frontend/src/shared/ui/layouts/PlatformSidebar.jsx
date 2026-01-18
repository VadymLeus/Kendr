// frontend/src/shared/ui/layouts/PlatformSidebar.jsx
import React, { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../../app/providers/CartContext';
import { AuthContext } from '../../../app/providers/AuthContext';
import UserMenu from './UserMenu';
import { Store, Layout, FileText, ShoppingCart, HelpCircle, ChevronLeft, ChevronRight, Settings, LogIn, Plus } from 'lucide-react';

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

    const sidebarWidth = isCollapsed ? '80px' : '280px';
    const styles = {
        container: {
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
            overflow: 'visible', 
        },
        logoContainer: {
            height: '90px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid var(--platform-border-color)',
            position: 'relative',
            flexShrink: 0
        },
        logoImage: {
            height: '70px',
            width: '70px',
            backgroundImage: 'var(--platform-logo-url)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            transition: 'all 0.3s ease',
        },
        toggleBtn: {
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
            outline: 'none'
        },
        navScrollArea: {
            flexGrow: 1,
            padding: '24px 12px',
            overflowY: 'auto',
            overflowX: 'hidden', 
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        },
        footer: {
            borderTop: '1px solid var(--platform-border-color)',
            padding: isCollapsed ? '16px 0' : '16px 16px',
            background: 'var(--platform-sidebar-bg)',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }
    };

    const cssStyles = `
        .sidebar-link {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none !important;
            padding: 12px 16px;
            border-radius: 8px;
            transition: all 0.2s ease;
            color: var(--platform-text-secondary);
            font-weight: 500;
            font-size: 0.95rem;
            white-space: nowrap;
            overflow: hidden;
            border: 1px solid transparent;
        }
        .sidebar-link:hover {
            color: var(--platform-accent);
            background: var(--platform-card-bg);
            border-color: var(--platform-border-color);
            text-decoration: none !important;
        }
        .sidebar-link.active {
            background-color: var(--platform-accent);
            color: var(--platform-accent-text);
            border-color: var(--platform-accent);
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .sidebar-create-btn {
            background-color: var(--platform-accent);
            color: var(--platform-accent-text) !important;
            justify-content: center;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .sidebar-create-btn:hover {
            background-color: var(--platform-accent-hover) !important;
            transform: translateY(-1px);
        }
        .login-btn-area {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px;
            border-radius: 8px;
            background: rgba(var(--platform-accent-rgb), 0.1);
            color: var(--platform-accent);
            font-weight: 600;
            text-decoration: none !important;
            transition: all 0.2s;
        }
        .login-btn-area:hover {
            background: var(--platform-accent);
            color: var(--platform-accent-text);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--platform-border-color); border-radius: 2px; }
    `;

    const SidebarLink = ({ to, icon: Icon, label, protectedLink, count, isCreateButton = false }) => {
        const handleClick = (e) => {
            if (protectedLink) handleProtectedLinkClick(e, to);
        };

        const className = isCreateButton ? 'sidebar-link sidebar-create-btn' : 'sidebar-link';
        const contentStyle = { 
            justifyContent: isCollapsed && !isCreateButton ? 'center' : (isCreateButton ? 'center' : 'flex-start'),
            textDecoration: 'none'
        };

        return (
            <NavLink 
                to={to} 
                className={className} 
                style={contentStyle} 
                onClick={handleClick}
                title={isCollapsed ? label : ''}
            >
                {isCreateButton && isCollapsed ? <Plus size={24} /> : <Icon size={20} />}
                
                {!isCollapsed && (
                    <span style={{ opacity: 1, transition: 'opacity 0.2s' }}>
                        {label} {count !== undefined && `(${count})`}
                    </span>
                )}
            </NavLink>
        );
    };

    return (
        <div style={styles.container} className="custom-scrollbar">
            <style>{cssStyles}</style>

            <div style={styles.logoContainer}>
                <Link to="/" style={{ display: 'flex', justifyContent: 'center', width: '100%', textDecoration: 'none' }}>
                    <div style={styles.logoImage} />
                </Link>
                <button 
                    onClick={onToggle} 
                    style={styles.toggleBtn}
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

            <div style={styles.navScrollArea} className="custom-scrollbar">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SidebarLink to="/create-site" icon={FileText} label="Створити сайт" protectedLink isCreateButton={true} />
                </div>
                <div className="nav-separator" style={{ height: '1px', background: 'var(--platform-border-color)', margin: '4px 8px', opacity: 0.5 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SidebarLink to="/my-sites" icon={Layout} label="Мої сайти" protectedLink />
                    <SidebarLink to="/media-library" icon={FileText} label="Медіатека" protectedLink />
                </div>
                <div className="nav-separator" style={{ height: '1px', background: 'var(--platform-border-color)', margin: '4px 8px', opacity: 0.5 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SidebarLink to="/catalog" icon={Store} label="Каталог сайтів" />
                    {user && <SidebarLink to="/cart" icon={ShoppingCart} label="Кошик" count={cartItems.length} />}
                </div>
                <div className="nav-separator" style={{ height: '1px', background: 'var(--platform-border-color)', margin: '4px 8px', opacity: 0.5 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SidebarLink to="/support" icon={HelpCircle} label="Підтримка" />
                    {user && <SidebarLink to="/settings" icon={Settings} label="Налаштування" />}
                </div>
            </div>

            <div style={styles.footer}>
                {!user ? (
                    <Link to="/login" className={isCollapsed ? 'sidebar-link' : 'login-btn-area'} title="Увійти" style={{ textDecoration: 'none' }}>
                        <LogIn size={20} />
                        {!isCollapsed && <span style={{ marginLeft: '8px' }}>Увійти</span>}
                    </Link>
                ) : (
                    <UserMenu isCollapsed={isCollapsed} />
                )}
            </div>
        </div>
    );
};

export default PlatformSidebar;