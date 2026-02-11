// frontend/src/shared/ui/layouts/PlatformSidebar.jsx
import React, { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../../app/providers/CartContext';
import { AuthContext } from '../../../app/providers/AuthContext';
import UserMenu from './UserMenu';
import { Store, Layout, FileText, ShoppingCart, HelpCircle, ChevronLeft, ChevronRight, LogIn, Plus, LayoutDashboard, AlertTriangle, Users, Globe, MessageSquare, Palette, Sliders } from 'lucide-react';

const PlatformSidebar = ({ isCollapsed, onToggle, variant = 'user' }) => {
    const { cartItems } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const isAdmin = variant === 'admin';
    const handleProtectedLink = (e, path) => {
        if (!user) {
            e.preventDefault();
            navigate('/login');
        }
    };
    const SidebarLink = ({ to, icon: Icon, label, protectedLink, count, isCreateButton }) => {
        const baseClass = `sidebar-link ${isCreateButton ? 'create-btn' : ''}`;
        return (
            <NavLink 
                to={to} 
                className={({ isActive }) => `${baseClass} ${isActive ? 'active' : ''}`}
                onClick={(e) => protectedLink && !isAdmin && handleProtectedLink(e, to)}
                title={isCollapsed ? label : ''}
                end={to === '/admin' || to === '/admin/dashboard'}
            >
                <div className="shrink-0 flex items-center justify-center w-6 h-6">
                    {isCreateButton && isCollapsed ? <Plus size={24} /> : <Icon size={20} />}
                </div>
                {!isCollapsed && (
                    <span className="truncate flex-1">{label} {count !== undefined && `(${count})`}</span>
                )}
            </NavLink>
        );
    };

    return (
        <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''} custom-scrollbar`}>
            <div className="sidebar-header">
                <Link to={isAdmin ? "/admin/dashboard" : "/"} className="flex justify-center w-full h-full items-center">
                    <div className="sidebar-logo" />
                </Link>
                <button onClick={onToggle} className="sidebar-toggle-btn">
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>
            <div className="sidebar-nav custom-scrollbar">
                {isAdmin ? (
                    <>
                        <SidebarLink to="/create-site" icon={FileText} label="Створити сайт" isCreateButton />
                        <div className="nav-separator" />
                        <SidebarLink to="/my-sites" icon={Layout} label="Мої сайти" />
                        <SidebarLink to="/media-library" icon={FileText} label="Медіатека" />
                        <SidebarLink to="/admin/templates" icon={Palette} label="Шаблони" />
                        <div className="nav-separator" />
                        <SidebarLink to="/admin/sites" icon={Globe} label="Всі сайти" />
                        <SidebarLink to="/admin/users" icon={Users} label="Користувачі" />
                        <div className="nav-separator" />
                        <SidebarLink to="/admin/tickets" icon={MessageSquare} label="Тікети" />
                        <SidebarLink to="/admin/reports" icon={AlertTriangle} label="Скарги" />
                        <div className="nav-separator" />
                        <SidebarLink to="/admin/control" icon={Sliders} label="Управління" />
                        <SidebarLink to="/admin/dashboard" icon={LayoutDashboard} label="Дашборд" />
                    </>
                ) : (
                    <>
                        <SidebarLink to="/create-site" icon={FileText} label="Створити сайт" protectedLink isCreateButton />
                        <div className="nav-separator" />
                        <SidebarLink to="/my-sites" icon={Layout} label="Мої сайти" protectedLink />
                        <SidebarLink to="/media-library" icon={FileText} label="Медіатека" protectedLink />
                        <div className="nav-separator" />
                        <SidebarLink to="/catalog" icon={Store} label="Каталог сайтів" />
                        {user && <SidebarLink to="/cart" icon={ShoppingCart} label="Кошик" count={cartItems.length} />}
                        <div className="nav-separator" />
                        <SidebarLink to="/support" icon={HelpCircle} label="Підтримка" />
                    </>
                )}
            </div>
            <div className="sidebar-footer">
                {!user ? (
                    <Link 
                        to="/login" 
                        className={`sidebar-link ${!isCollapsed ? 'justify-center bg-blue-50/10 text-(--platform-accent)' : 'justify-center'}`}
                        title="Увійти"
                    >
                        <LogIn size={20} />
                        {!isCollapsed && <span>Увійти</span>}
                    </Link>
                ) : (
                    <UserMenu isCollapsed={isCollapsed} customSubtitle={isAdmin ? "Адміністратор" : null} />
                )}
            </div>
        </div>
    );
};

export default PlatformSidebar;