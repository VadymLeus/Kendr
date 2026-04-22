// frontend/src/shared/ui/layouts/PlatformSidebar.jsx
import React, { useContext } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../../../app/providers/CartContext';
import { AuthContext } from '../../../app/providers/AuthContext';
import UserMenu from './UserMenu';
import { Store, Layout, FileText, ShoppingCart, HelpCircle, ChevronLeft, ChevronRight, LogIn, Plus, LayoutDashboard, AlertTriangle, Users, Globe, MessageSquare, Palette, Sliders, Package, Shield, CreditCard } from 'lucide-react';

const PlatformSidebar = ({ isCollapsed, onToggle, variant = 'user', isMobileOpen, onMobileOpen, onMobileClose }) => {
    const { cartItems } = useContext(CartContext);
    const { user, isAdmin: isStrictAdmin, isModerator } = useContext(AuthContext); 
    const navigate = useNavigate();
    const location = useLocation();
    const isStaff = isStrictAdmin || isModerator;
    const isAdminView = variant === 'admin' || (isStaff && location.pathname.startsWith('/admin'));
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
                onClick={(e) => {
                    if (onMobileClose) onMobileClose();
                    if (protectedLink && !isAdminView) handleProtectedLink(e, to);
                }}
                title={isCollapsed && !isMobileOpen ? label : ''}
                end={to === '/admin' || to === '/admin/dashboard'}
            >
                <div className="shrink-0 flex items-center justify-center w-6 h-6">
                    {isCreateButton && isCollapsed && !isMobileOpen ? <Plus size={24} /> : <Icon size={20} />}
                </div>
                {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate flex-1">{label} {count !== undefined && `(${count})`}</span>
                )}
            </NavLink>
        );
    };
    
    return (
        <>
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-1250 md:hidden transition-opacity"
                    onClick={onMobileClose}
                />
            )}
            <div 
                className={`sidebar-container ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''} custom-scrollbar relative`}
                style={{ zIndex: 1300 }}
            >
                <button 
                    onClick={onToggle} 
                    title={isCollapsed ? "Розгорнути панель" : "Згорнути панель"} 
                    className="group hidden md:flex absolute top-18.75 -right-4 w-4 h-24 bg-(--platform-sidebar-bg) border border-(--platform-border-color) shadow-sm cursor-pointer transition-all duration-200 focus:outline-none z-1310 items-center justify-center rounded-r-lg hover:border-(--platform-accent) hover:shadow-md"
                >
                    <div className="transition-transform duration-200 group-hover:scale-110 text-(--platform-text-secondary) group-hover:text-(--platform-accent) flex items-center justify-center -ml-0.5">
                        {isCollapsed ? <ChevronRight size={16} strokeWidth={2.5} /> : <ChevronLeft size={16} strokeWidth={2.5} />}
                    </div>
                </button>
                <button 
                    onClick={isMobileOpen ? onMobileClose : onMobileOpen} 
                    title={isMobileOpen ? "Згорнути панель" : "Розгорнути панель"} 
                    className="group md:hidden absolute top-18.75 -right-6 w-6 h-24 bg-(--platform-sidebar-bg) border border-(--platform-border-color) shadow-md cursor-pointer transition-all duration-200 focus:outline-none z-1310 flex items-center justify-center rounded-r-lg hover:border-(--platform-accent)"
                >
                    <div className="transition-transform duration-200 group-hover:scale-110 text-(--platform-text-secondary) group-hover:text-(--platform-accent) flex items-center justify-center -ml-1">
                        {isMobileOpen ? <ChevronLeft size={18} strokeWidth={2.5} /> : <ChevronRight size={18} strokeWidth={2.5} />}
                    </div>
                </button>
                <div className="sidebar-header relative">
                    <Link to={isAdminView ? "/admin/dashboard" : "/"} className="flex justify-center w-full h-full items-center" onClick={onMobileClose}>
                        <div className="sidebar-logo" />
                    </Link>
                </div>
                <div className="sidebar-nav custom-scrollbar">
                    {isAdminView ? (
                        <>
                            <SidebarLink to="/create-site" icon={FileText} label="Створити сайт" isCreateButton />
                            <div className="nav-separator" />
                            <SidebarLink to="/my-sites" icon={Layout} label="Мої сайти" />
                            <SidebarLink to="/admin/templates" icon={Palette} label="Шаблони" />
                            <SidebarLink to="/media-library" icon={FileText} label="Медіатека" />
                            <div className="nav-separator" />
                            <SidebarLink to="/admin/users-sites" icon={Users} label="Користувачі / Сайти" />
                            <SidebarLink to="/admin/support-hub" icon={MessageSquare} label="Тікети / Скарги" />
                            {isStrictAdmin && (
                                <SidebarLink to="/admin/billing" icon={CreditCard} label="Білінг" />
                            )}
                            <SidebarLink to="/admin/dashboard" icon={LayoutDashboard} label="Дашборд" />
                            {isStrictAdmin && (
                                <>
                                    <div className="nav-separator" />
                                    <SidebarLink to="/admin/control" icon={Sliders} label="Управління" />
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <SidebarLink to="/create-site" icon={FileText} label="Створити сайт" protectedLink isCreateButton />
                            <div className="nav-separator" />
                            {user && (
                                <>
                                    <SidebarLink to="/my-sites" icon={Layout} label="Мої сайти" protectedLink />
                                    <SidebarLink to="/media-library" icon={FileText} label="Медіатека" protectedLink />
                                    <div className="nav-separator" />
                                </>
                            )}
                            <SidebarLink to="/catalog" icon={Store} label="Каталог сайтів" />
                            {user && (
                                <>
                                    <SidebarLink to="/my-orders" icon={Package} label="Мої замовлення" protectedLink />
                                    <SidebarLink to="/cart" icon={ShoppingCart} label="Кошик" count={cartItems.length} />
                                </>
                            )}
                            <div className="nav-separator" />
                            {user ? (
                                <SidebarLink to="/support" icon={HelpCircle} label="Підтримка" />
                            ) : (
                                <SidebarLink to="/rules" icon={Shield} label="Правила" />
                            )}
                        </>
                    )}
                </div>
                <div className="sidebar-footer">
                    {!user ? (
                        <Link 
                            to="/login" 
                            className={`sidebar-link ${!isCollapsed || isMobileOpen ? 'justify-center bg-blue-50/10 text-(--platform-accent)' : 'justify-center'}`}
                            title="Увійти"
                            onClick={onMobileClose}
                        >
                            <LogIn size={20} />
                            {(!isCollapsed || isMobileOpen) && <span>Увійти</span>}
                        </Link>
                    ) : (
                        <div onClick={onMobileClose}>
                            <UserMenu 
                                isCollapsed={isCollapsed && !isMobileOpen} 
                                customSubtitle={isAdminView ? (isStrictAdmin ? "Адміністратор" : "Модератор") : null} 
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PlatformSidebar;