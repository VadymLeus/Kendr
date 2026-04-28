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
    const renderLink = ({ to, icon: Icon, label, protectedLink, count, isCreateButton }) => {
        const baseClass = `sidebar-link ${isCreateButton ? 'create-btn' : ''}`;
        return (
            <NavLink 
                key={to}
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
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden transition-opacity"
                    style={{ zIndex: 20000 }}
                    onClick={onMobileClose}
                />
            )}
            <div 
                className={`sidebar-container ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''} custom-scrollbar relative`}
                style={{ zIndex: 20001, transition: 'none' }}
            >
                <button 
                    onClick={onToggle} 
                    title={isCollapsed ? "Розгорнути панель" : "Згорнути панель"} 
                    className="group hidden md:flex absolute top-18.75 -right-4 w-4 h-24 bg-(--platform-sidebar-bg) border border-(--platform-border-color) shadow-sm cursor-pointer transition-all duration-200 focus:outline-none items-center justify-center rounded-r-lg hover:border-(--platform-accent) hover:shadow-md"
                    style={{ zIndex: 20002 }}
                >
                    <div className="transition-transform duration-200 group-hover:scale-110 text-(--platform-text-secondary) group-hover:text-(--platform-accent) flex items-center justify-center -ml-0.5">
                        {isCollapsed ? <ChevronRight size={16} strokeWidth={2.5} /> : <ChevronLeft size={16} strokeWidth={2.5} />}
                    </div>
                </button>
                <button 
                    onClick={isMobileOpen ? onMobileClose : onMobileOpen} 
                    title={isMobileOpen ? "Згорнути панель" : "Розгорнути панель"} 
                    className="group md:hidden absolute top-18.75 -right-6 w-6 h-24 bg-(--platform-sidebar-bg) border border-(--platform-border-color) shadow-md cursor-pointer transition-all duration-200 focus:outline-none items-center justify-center rounded-r-lg hover:border-(--platform-accent)"
                    style={{ zIndex: 20002 }}
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
                            {renderLink({ to: "/create-site", icon: FileText, label: "Створити сайт", isCreateButton: true })}
                            <div className="nav-separator" />
                            {renderLink({ to: "/my-sites", icon: Layout, label: "Мої сайти" })}
                            {renderLink({ to: "/admin/templates", icon: Palette, label: "Шаблони" })}
                            {renderLink({ to: "/media-library", icon: FileText, label: "Медіатека" })}
                            <div className="nav-separator" />
                            {renderLink({ to: "/admin/users-sites", icon: Users, label: "Користувачі / Сайти" })}
                            {renderLink({ to: "/admin/support-hub", icon: MessageSquare, label: "Тікети / Скарги" })}
                            {isStrictAdmin && renderLink({ to: "/admin/billing", icon: CreditCard, label: "Білінг" })}
                            {renderLink({ to: "/admin/dashboard", icon: LayoutDashboard, label: "Дашборд" })}
                            {isStrictAdmin && (
                                <>
                                    <div className="nav-separator" />
                                    {renderLink({ to: "/admin/control", icon: Sliders, label: "Управління" })}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {renderLink({ to: "/create-site", icon: FileText, label: "Створити сайт", protectedLink: true, isCreateButton: true })}
                            <div className="nav-separator" />
                            {user && (
                                <>
                                    {renderLink({ to: "/my-sites", icon: Layout, label: "Мої сайти", protectedLink: true })}
                                    {renderLink({ to: "/media-library", icon: FileText, label: "Медіатека", protectedLink: true })}
                                    <div className="nav-separator" />
                                </>
                            )}
                            {renderLink({ to: "/catalog", icon: Store, label: "Каталог сайтів" })}
                            {user && (
                                <>
                                    {renderLink({ to: "/my-orders", icon: Package, label: "Мої замовлення", protectedLink: true })}
                                    {renderLink({ to: "/cart", icon: ShoppingCart, label: "Кошик", count: cartItems.length })}
                                </>
                            )}
                            <div className="nav-separator" />
                            {user ? (
                                renderLink({ to: "/support", icon: HelpCircle, label: "Підтримка" })
                            ) : (
                                renderLink({ to: "/rules", icon: Shield, label: "Правила" })
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