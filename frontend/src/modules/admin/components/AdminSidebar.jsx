// frontend/src/modules/admin/components/AdminSidebar.jsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import UserMenu from '../../../shared/ui/layouts/UserMenu';
import { LayoutDashboard, MessageSquare, Users, Palette, BarChart, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminSidebar = ({ isCollapsed, onToggle }) => {
    const sidebarWidth = isCollapsed ? '80px' : '260px';
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
            zIndex: 1100,
            transition: 'width 0.3s cubic-bezier(0.2, 0, 0, 1)',
            boxSizing: 'border-box',
            borderRight: '1px solid var(--platform-border-color)',
            overflow: 'visible'
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
            height: '60px',
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            transition: 'all 0.3s ease'
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
            zIndex: 1300,
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
            gap: '8px'
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
            borderRadius: 8px;
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
        }
        .sidebar-link.active {
            background-color: var(--platform-accent);
            color: var(--platform-accent-text);
            border-color: var(--platform-accent);
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--platform-border-color); border-radius: 2px; }
    `;

    const AdminLink = ({ to, icon: Icon, label }) => {
        return (
            <NavLink 
                to={to} 
                end={to === '/admin'}
                className="sidebar-link"
                style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                title={isCollapsed ? label : ''}
            >
                <Icon size={20} />
                {!isCollapsed && (
                    <span style={{ opacity: 1, transition: 'opacity 0.2s' }}>
                        {label}
                    </span>
                )}
            </NavLink>
        );
    };

    return (
        <div style={styles.container} className="custom-scrollbar">
            <style>{cssStyles}</style>
            <div style={styles.logoContainer}>
                <Link to="/admin" style={{ display: 'flex', justifyContent: 'center', width: '100%', textDecoration: 'none' }}>
                    <img src="/admin.webp" alt="Admin" style={styles.logoImage} />
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
                <AdminLink to="/admin" icon={LayoutDashboard} label="Всі сайти" />
                <AdminLink to="/admin/support" icon={MessageSquare} label="Підтримка" />
                <AdminLink to="/admin/users" icon={Users} label="Користувачі" />
                <AdminLink to="/admin/templates" icon={Palette} label="Шаблони" />
                <AdminLink to="/admin/analytics" icon={BarChart} label="Аналітика" />
            </div>

            <div style={styles.footer}>
                <UserMenu isCollapsed={isCollapsed} customSubtitle="Адміністратор" />
            </div>
        </div>
    );
};

export default AdminSidebar;