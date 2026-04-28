// frontend/src/modules/renderer/components/SiteControls.jsx
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import { FavoritesContext } from '../../../app/providers/FavoritesContext';
import SiteDetailsPanel from '../../admin/components/SiteDetailsPanel';
import apiClient from '../../../shared/api/api';
import { toast } from 'react-toastify';
import { Settings, Star, ShieldAlert } from 'lucide-react';

const AdminPanelModal = ({ isOpen, onClose, siteData, currentUser }) => {
    if (!isOpen) return null;
    const mockActions = {
        delete: async (path) => {
            try {
                await apiClient.delete(`/sites/${path}`);
                toast.success('Сайт видалено');
                onClose();
            } catch (err) { toast.error('Помилка видалення'); }
        },
        suspend: async (path) => {
             try {
                await apiClient.post(`/admin/sites/${path}/suspend`, { reason: 'Порушення правил' });
                toast.success('Сайт заблоковано');
            } catch (err) { toast.error('Помилка блокування'); }
        },
        restore: async (path) => {
            try {
                await apiClient.post(`/admin/sites/${path}/restore`);
                toast.success('Сайт відновлено');
            } catch (err) { toast.error('Помилка відновлення'); }
        },
        probation: async (path) => {
             try {
                await apiClient.post(`/admin/sites/${path}/probation`);
                toast.success('Видано випробувальний термін');
            } catch (err) { toast.error('Помилка зміни статусу'); }
        }
    };
    return (
        <div className="fixed inset-0 bg-black/60 z-3000 flex justify-end">
            <div className="w-100 h-full bg-(--platform-bg) shadow-2xl animate-[slideInRight_0.3s_ease-out] relative">
                <div className="h-full overflow-y-auto">
                    <SiteDetailsPanel 
                        currentUser={currentUser} 
                        site={siteData} 
                        onClose={onClose} 
                        actions={mockActions} 
                    />
                </div>
            </div>
        </div>
    );
};

const SiteControls = ({ siteData }) => {
    const { user } = useContext(AuthContext) || {};
    const favContext = useContext(FavoritesContext) || {};
    const favoriteSiteIds = favContext.favoriteSiteIds || new Set();
    const addFavorite = favContext.addFavorite || (() => {});
    const removeFavorite = favContext.removeFavorite || (() => {});
    const [isBtnHovered, setIsBtnHovered] = useState(false);
    const [isAdminBtnHovered, setIsAdminBtnHovered] = useState(false);
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
    if (!siteData) return null;
    const isOwner = user && user.id === siteData.user_id;
    const isFavorite = favoriteSiteIds.has(parseInt(siteData.id));
    const isStaff = user && (user.role === 'admin' || user.role === 'moderator');
    const showAdminControls = isStaff && !isOwner;
    const iconBtnBaseClass = "flex items-center justify-center w-11 h-11 rounded-xl cursor-pointer transition-all duration-200 shrink-0 backdrop-blur-md border";
    const normalStateClass = "bg-(--site-card-bg)/90 border-(--site-border-color)";
    const hoverStateClass = "bg-(--site-bg) border-(--site-accent)";
    return (
        <>
            <div className="fixed top-4 right-4 md:top-6 md:right-8 z-2000 flex gap-2">
                {isOwner && (
                    <Link 
                        to={`/dashboard/${siteData.site_path}`}
                        className={`${iconBtnBaseClass} no-underline ${isBtnHovered ? hoverStateClass : normalStateClass}`}
                        style={{ color: isBtnHovered ? 'var(--site-accent)' : 'var(--site-text-secondary)' }}
                        title="Налаштування сайту"
                        onMouseEnter={() => setIsBtnHovered(true)}
                        onMouseLeave={() => setIsBtnHovered(false)}
                    >
                        <Settings size={22} />
                    </Link>
                )}
                {!isOwner && !isStaff && (
                    <button 
                        className={`${iconBtnBaseClass} ${isBtnHovered || isFavorite ? hoverStateClass : normalStateClass}`}
                        style={{ color: isBtnHovered || isFavorite ? 'var(--site-accent)' : 'var(--site-text-secondary)' }}
                        onClick={() => isFavorite ? removeFavorite(siteData.id) : addFavorite(siteData.id)}
                        title={isFavorite ? "Видалити з обраних" : "Додати в обрані"}
                        onMouseEnter={() => setIsBtnHovered(true)}
                        onMouseLeave={() => setIsBtnHovered(false)}
                    >
                        <Star size={22} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                )}
                {showAdminControls && (
                    <button 
                        className={`${iconBtnBaseClass} ${isAdminBtnHovered || isAdminPanelOpen ? hoverStateClass : normalStateClass}`}
                        onClick={() => setIsAdminPanelOpen(true)}
                        title="Модерація сайту"
                        style={{ 
                            marginLeft: '8px', 
                            color: isAdminBtnHovered || isAdminPanelOpen ? 'var(--site-accent)' : 'var(--site-text-secondary)' 
                        }}
                        onMouseEnter={() => setIsAdminBtnHovered(true)}
                        onMouseLeave={() => setIsAdminBtnHovered(false)}
                    >
                        <ShieldAlert size={22} />
                    </button>
                )}
            </div>
            <AdminPanelModal 
                isOpen={isAdminPanelOpen} 
                onClose={() => setIsAdminPanelOpen(false)} 
                siteData={siteData}
                currentUser={user}
            />
        </>
    );
};

export default SiteControls;