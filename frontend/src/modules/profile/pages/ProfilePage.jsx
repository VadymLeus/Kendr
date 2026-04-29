// frontend/src/modules/profile/pages/ProfilePage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import apiClient, { suspendUser, restoreUser } from '../../../shared/api/api';
import { AuthContext } from '../../../app/providers/AuthContext';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { Button } from '../../../shared/ui/elements/Button';
import Avatar from '../../../shared/ui/elements/Avatar';
import SiteGridCard from '../../../shared/ui/complex/SiteGridCard'; 
import SiteFilters from '../../../shared/ui/complex/SiteFilters';
import LoadingState from '../../../shared/ui/complex/LoadingState';
import UserDetailsPanel from '../../admin/components/UserDetailsPanel';
import NotFoundPage from '../../../pages/NotFoundPage';
import { Send, Instagram, Globe, Settings, Calendar, Grid, User as UserIcon, ExternalLink, EyeOff, Layout, ShieldAlert, AlertTriangle, Shield } from 'lucide-react';

const SORT_OPTIONS = [
    { value: 'created_at:desc', label: 'Нові' },
    { value: 'created_at:asc', label: 'Старі' },
    { value: 'views:desc', label: 'Популярні' },
    { value: 'title:asc', label: 'Назва (А-Я)' },
];

const getFormattedDate = (dateString) => {
    if (!dateString) return 'Невідомо';
    try {
        let safeString = typeof dateString === 'string' ? dateString.trim() : dateString;
        if (typeof safeString === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(safeString)) {
            safeString = safeString.replace(' ', 'T');
        }
        const date = new Date(safeString);
        if (isNaN(date.getTime())) {
            console.error("Не вдалося розпарсити дату на хостингу:", dateString);
            return 'Невідомо';
        }
        return date.toLocaleDateString('uk-UA');
    } catch (e) {
        return 'Невідомо';
    }
};

const ProfilePage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { user: authUser } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [errorStatus, setErrorStatus] = useState(null);
    const [userSites, setUserSites] = useState([]);
    const [sitesLoading, setSitesLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('created_at:desc');
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
    const isOwner = authUser && authUser.slug === slug;
    useEffect(() => {
        if (isOwner && (authUser?.role === 'admin' || authUser?.role === 'moderator')) {
            setErrorStatus(404);
            setLoadingProfile(false);
            return;
        }
        const fetchProfile = async () => {
            try {
                setLoadingProfile(true);
                setErrorStatus(null);
                const response = await apiClient.get(`/users/${slug}`, {
                    suppressToast: true
                });
                const data = response.data?.user || response.data?.data || response.data;
                if (data && (data.role === 'admin' || data.role === 'moderator')) {
                    setErrorStatus(404);
                    return;
                }
                setProfileData(data);
            } catch (err) {
                if (err.response) {
                    setErrorStatus(err.response.status);
                } else {
                    setErrorStatus(500);
                }
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, [slug, isOwner, authUser]);

    const fetchUserSites = useCallback(async () => {
        if (!profileData) return;
        try {
            setSitesLoading(true);
            const params = {
                userId: profileData.id,
                search: searchTerm,
                sort: sortOption,
            };
            const res = await apiClient.get('/sites/catalog', { params });
            setUserSites(res.data);
        } catch (error) {
            console.error("Failed to load user sites", error);
        } finally {
            setSitesLoading(false);
        }
    }, [profileData, searchTerm, sortOption]);

    useEffect(() => {
        if (profileData) {
            const timer = setTimeout(() => {
                fetchUserSites();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [fetchUserSites]);

    const handleDeleteUser = (userId) => {
        confirm({ 
            title: 'Видалити акаунт?', 
            message: 'Ця дія незворотна. Всі дані будуть видалені. Введіть "DELETE" для підтвердження.', 
            requireInput: true,
            expectedInput: 'DELETE',
            confirmText: 'Видалити повністю', 
            danger: true,
            onConfirm: async (inputValue) => { 
                if (inputValue !== 'DELETE') return toast.error('Невірне підтвердження.');
                try { 
                    await apiClient.delete(`/admin/users/${userId}`); 
                    toast.success('Користувача видалено'); 
                    setIsAdminPanelOpen(false);
                    navigate('/'); 
                } catch { toast.error('Помилка видалення'); } 
            } 
        });
    };

    const handleSuspendUser = (userId) => {
        confirm({ 
            title: 'Заблокувати назавжди?', 
            message: 'Пошта залишиться в блеклісті, але сайти, медіафайли та персональні дані будуть незворотно стерті. Введіть "SUSPEND" для підтвердження.', 
            requireInput: true,
            expectedInput: 'SUSPEND',
            confirmText: 'Заблокувати', 
            danger: true,
            onConfirm: async (inputValue) => { 
                if (inputValue !== 'SUSPEND') return toast.error('Невірне підтвердження.');
                try { 
                    await suspendUser(userId); 
                    toast.success('Користувача заблоковано'); 
                    setProfileData(prev => ({ ...prev, status: 'suspended' }));
                    setIsAdminPanelOpen(false);
                } catch (error) { toast.error(error.response?.data?.message || 'Помилка блокування'); } 
            } 
        });
    };

    const handleRestoreUser = (userId) => {
        confirm({ 
            title: 'Розблокувати акаунт?', 
            message: 'Користувач знову зможе користуватися платформою. Введіть "RESTORE" для підтвердження.', 
            type: 'success',
            requireInput: true,
            expectedInput: 'RESTORE',
            confirmText: 'Розблокувати',
            onConfirm: async (inputValue) => { 
                if (inputValue !== 'RESTORE') return toast.error('Невірне підтвердження.');
                try { 
                    await restoreUser(userId); 
                    toast.success('Користувача розблоковано'); 
                    setProfileData(prev => ({ ...prev, status: 'published' }));
                    setIsAdminPanelOpen(false);
                } catch (error) { toast.error(error.response?.data?.message || 'Помилка розблокування'); } 
            } 
        });
    };

    if (loadingProfile) return <LoadingState />;
    if (errorStatus === 403) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] w-full text-center text-(--platform-text-secondary) p-6 sm:p-8">
                <Helmet><title>Приватний профіль | Kendr</title></Helmet>
                <div className="w-20 h-20 bg-(--platform-bg) rounded-full flex items-center justify-center mb-6 border border-(--platform-border-color)">
                    <EyeOff size={40} />
                </div>
                <h2 className="text-xl sm:text-2xl text-(--platform-text-primary) font-bold mb-2">Цей профіль закритий</h2>
                <p className="max-w-100 leading-relaxed text-sm sm:text-base mb-6">Користувач обмежив доступ до своєї сторінки.</p>
                <Link to="/" className="no-underline"><Button variant="secondary">На головну</Button></Link>
            </div>
        );
    }
    
    if (errorStatus === 404) return <NotFoundPage />;
    if (errorStatus) return <div className="text-center p-16 text-(--platform-danger)">Сталася помилка при завантаженні профілю.</div>;
    const displayUsername = profileData?.username || 'Користувач';
    const displayAvatarUrl = isOwner ? authUser?.avatar_url : profileData?.avatar_url;
    const displayDate = profileData?.createdAt || profileData?.created_at || (isOwner ? authUser?.created_at : null);
    const displaySiteCount = profileData?.siteCount !== undefined ? profileData.siteCount : (sitesLoading ? '-' : userSites.length);
    const displayTotalViews = profileData?.totalViews !== undefined ? profileData.totalViews : (sitesLoading ? '-' : userSites.reduce((sum, site) => sum + (site.view_count || 0), 0));
    const userAccentColor = profileData?.accent_color || 'var(--platform-accent)';
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 min-h-[80vh]">
            <Helmet>
                <title>{`${displayUsername} | Профіль Kendr`}</title>
            </Helmet>
            <div className="bg-(--platform-card-bg) rounded-2xl sm:rounded-3xl border border-(--platform-border-color) overflow-hidden mb-6 sm:mb-8 shadow-sm">
                <div 
                    className="h-32 sm:h-48 md:h-60 w-full relative" 
                    style={{ background: `linear-gradient(to bottom, ${userAccentColor}, var(--platform-card-bg))` }}
                ></div>
                <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 md:gap-8 relative z-10 -mt-16 sm:-mt-20">
                    <div className="rounded-full border-4 sm:border-6 border-(--platform-card-bg) bg-(--platform-bg) shadow-lg shrink-0 flex items-center justify-center">
                        <Avatar 
                            url={displayAvatarUrl} 
                            name={displayUsername} 
                            size={120} 
                            fontSize="48px" 
                            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40"
                            style={{ filter: profileData.status === 'suspended' ? 'grayscale(100%)' : 'none' }}
                        />
                    </div>
                    <div className="flex-1 w-full flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 sm:gap-0 text-center sm:text-left pt-2 sm:pt-0">
                        <div>
                            <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-1 sm:mb-2">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-(--platform-text-primary) m-0 leading-tight">
                                    {displayUsername}
                                </h1>
                                {authUser?.role === 'admin' && (
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setIsAdminPanelOpen(true)}
                                        className="p-1.5 text-(--platform-accent) hover:bg-(--platform-hover-bg) rounded-lg"
                                        title="Керування профілем (Адмін)"
                                    >
                                        <Shield size={20} className="sm:w-5 sm:h-5 w-4 h-4" />
                                    </Button>
                                )}
                                {!profileData.is_profile_public && isOwner && (
                                    <div title="Приватний профіль (бачите тільки ви)" className="pb-1">
                                        <EyeOff size={20} className="text-(--platform-text-secondary) sm:w-6 sm:h-6 w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <p className="text-(--platform-text-secondary) m-0 flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm md:text-base">
                                <Calendar size={16} className="text-(--platform-accent) shrink-0"/> 
                                <span>На платформі з {getFormattedDate(displayDate)}</span>
                            </p>
                        </div>
                        {isOwner && (
                            <Link to="/settings" className="no-underline shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                <Button variant="secondary" icon={<Settings size={18}/>} className="w-full sm:w-auto">Налаштувати</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            {profileData.status === 'suspended' && (
                <div className="bg-[color-mix(in_srgb,var(--platform-danger),transparent_95%)] border border-(--platform-danger) rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 mb-6 shadow-sm text-center sm:text-left">
                     <AlertTriangle size={24} className="text-(--platform-danger) shrink-0" />
                     <div className="font-semibold text-(--platform-danger) text-sm sm:text-base">Цей акаунт заблоковано за порушення правил платформи.</div>
                </div>
            )}
            {profileData.warnings && profileData.warnings.length > 0 && (
                <div className="bg-[color-mix(in_srgb,var(--platform-danger),transparent_95%)] border border-(--platform-danger) rounded-2xl overflow-hidden mb-6 sm:mb-8 shadow-sm">
                    <div className="p-4 sm:p-6 border-b border-[color-mix(in_srgb,var(--platform-danger),transparent_80%)] flex items-center gap-3">
                        <ShieldAlert size={24} className="text-(--platform-danger) shrink-0" />
                        <h3 className="text-lg sm:text-xl font-bold text-(--platform-danger) m-0">
                            Активні страйки ({profileData.warnings.length}/3)
                        </h3>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="flex gap-2 mb-6">
                             {[1, 2, 3].map(i => (
                                <div key={i} className={`h-2 flex-1 rounded-full ${i <= profileData.warnings.length ? 'bg-(--platform-danger)' : 'bg-(--platform-border-color)'}`}></div>
                             ))}
                        </div>
                        <div className="flex flex-col gap-3 sm:gap-4">
                            {profileData.warnings.map((warning, index) => (
                                <div key={warning.id || index} className="p-3 sm:p-4 rounded-xl bg-(--platform-bg) border border-(--platform-border-color) flex flex-col sm:flex-row items-start gap-3">
                                    <AlertTriangle size={20} className="text-(--platform-warning) shrink-0 mt-0.5 hidden sm:block" />
                                    <div>
                                        <div className="font-semibold text-(--platform-text-primary) mb-1 flex items-center gap-2">
                                            <AlertTriangle size={16} className="text-(--platform-warning) sm:hidden" />
                                            Попередження #{index + 1}
                                        </div>
                                        {warning.reason_note && (
                                            <div className="text-sm sm:text-base text-(--platform-text-primary) mb-1">
                                                {warning.reason_note}
                                            </div>
                                        )}
                                        <div className="text-xs sm:text-sm text-(--platform-text-secondary)">
                                            Отримано: {getFormattedDate(warning.created_at)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {isOwner && (
                            <div className="mt-6 text-xs sm:text-sm text-(--platform-text-secondary) italic text-center sm:text-left">
                                При досягненні 3-х страйків ваш акаунт буде заблоковано або видалено.
                            </div>
                        )}
                    </div>
                </div>
            )}
            {profileData.bio && (
                <div className="bg-(--platform-card-bg) rounded-2xl sm:rounded-3xl border border-(--platform-border-color) overflow-hidden mb-6 sm:mb-8 shadow-sm">
                    <div className="p-4 sm:p-6 border-b border-(--platform-border-color) flex items-center gap-3">
                        <UserIcon size={24} className="text-(--platform-accent) shrink-0" />
                        <h3 className="text-lg sm:text-xl font-bold text-(--platform-text-primary) m-0">Про мене</h3>
                    </div>
                    <div className="p-4 sm:p-6">
                        <p className="text-sm sm:text-base text-(--platform-text-secondary) leading-relaxed whitespace-pre-wrap m-0">{profileData.bio}</p>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                <div className="bg-(--platform-card-bg) rounded-2xl sm:rounded-3xl border border-(--platform-border-color) overflow-hidden shadow-sm h-full flex flex-col">
                    <div className="p-4 sm:p-6 border-b border-(--platform-border-color) flex items-center gap-3 shrink-0">
                        <Grid size={24} className="text-(--platform-accent) shrink-0" />
                        <h3 className="text-lg sm:text-xl font-bold text-(--platform-text-primary) m-0">Статистика</h3>
                    </div>
                    <div className="p-4 sm:p-6 flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-center py-3 sm:py-4 border-b border-(--platform-border-color) text-sm sm:text-base text-(--platform-text-secondary)">
                            <span>Опубліковано сайтів</span>
                            <span className="font-bold text-lg sm:text-xl text-(--platform-text-primary)">
                                {displaySiteCount}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3 sm:py-4 text-sm sm:text-base text-(--platform-text-secondary)">
                            <span>Всього переглядів</span>
                            <span className="font-bold text-lg sm:text-xl text-(--platform-accent)">
                                {displayTotalViews}
                            </span>
                        </div>
                    </div>
                </div>
                {profileData.socials && Object.values(profileData.socials).some(v => v) ? (
                    <div className="bg-(--platform-card-bg) rounded-2xl sm:rounded-3xl border border-(--platform-border-color) overflow-hidden shadow-sm h-full flex flex-col">
                        <div className="p-4 sm:p-6 border-b border-(--platform-border-color) flex items-center gap-3 shrink-0">
                            <Globe size={24} className="text-(--platform-accent) shrink-0" />
                            <h3 className="text-lg sm:text-xl font-bold text-(--platform-text-primary) m-0">Контакти</h3>
                        </div>
                        <div className="p-4 sm:p-6 flex-1 flex flex-col gap-3 justify-center">
                            {profileData.socials.telegram && (
                                <a href={`https://t.me/${profileData.socials.telegram.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-(--platform-bg) hover:bg-(--platform-hover-bg) text-(--platform-text-primary) no-underline text-sm sm:text-base font-medium transition-colors border border-transparent">
                                    <Send size={20} style={{ color: '#0088cc' }} className="shrink-0"/> 
                                    <span className="truncate">Telegram</span>
                                    <ExternalLink size={16} className="ml-auto opacity-50 shrink-0"/>
                                </a>
                            )}
                            {profileData.socials.instagram && (
                                <a href={`https://instagram.com/${profileData.socials.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-(--platform-bg) hover:bg-(--platform-hover-bg) text-(--platform-text-primary) no-underline text-sm sm:text-base font-medium transition-colors border border-transparent">
                                    <Instagram size={20} style={{ color: '#E1306C' }} className="shrink-0"/> 
                                    <span className="truncate">Instagram</span>
                                    <ExternalLink size={16} className="ml-auto opacity-50 shrink-0"/>
                                </a>
                            )}
                            {profileData.socials.website && (
                                <a href={profileData.socials.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-(--platform-bg) hover:bg-(--platform-hover-bg) text-(--platform-text-primary) no-underline text-sm sm:text-base font-medium transition-colors border border-transparent">
                                    <Globe size={20} className="text-(--platform-text-secondary) shrink-0"/> 
                                    <span className="truncate">Веб-сайт</span>
                                    <ExternalLink size={16} className="ml-auto opacity-50 shrink-0"/>
                                </a>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-(--platform-card-bg) rounded-2xl sm:rounded-3xl border border-(--platform-border-color) overflow-hidden shadow-sm h-full flex items-center justify-center p-8">
                         <div className="text-center text-(--platform-text-secondary) text-sm sm:text-base">
                            <p>Контакти відсутні</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="bg-(--platform-card-bg) rounded-2xl sm:rounded-3xl border border-(--platform-border-color) overflow-hidden shadow-sm">
                <div className="p-4 sm:p-6 border-b border-(--platform-border-color) flex items-center gap-3">
                    <Layout size={24} className="text-(--platform-accent) shrink-0" />
                    <h3 className="text-lg sm:text-xl font-bold text-(--platform-text-primary) m-0">Публічні сайти</h3>
                </div>
                <SiteFilters 
                    searchTerm={searchTerm} 
                    onSearchChange={setSearchTerm} 
                    sortOption={sortOption} 
                    onSortChange={setSortOption}
                    sortOptions={SORT_OPTIONS}
                    tags={[]} 
                    showStarFilter={false}
                />
                
                {sitesLoading ? (
                    <div className="py-8">
                        <LoadingState layout="component" iconSize={32} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 p-4 sm:p-6">
                        {userSites.length > 0 ? (
                            userSites.map(site => (
                                <SiteGridCard 
                                    key={site.id} 
                                    site={site} 
                                    variant="public"
                                    formatDate={(d) => getFormattedDate(d)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 sm:py-16 px-4 text-(--platform-text-secondary)">
                                 <div className="mb-4 opacity-50 flex justify-center">
                                    <Globe size={40} className="sm:w-12 sm:h-12" />
                                 </div>
                                 <p className="text-sm sm:text-base lg:text-lg m-0">
                                     {searchTerm ? 'Нічого не знайдено за вашим запитом' : 'У користувача поки немає публічних сайтів'}
                                 </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isAdminPanelOpen && profileData && (
                <UserDetailsPanel 
                    user={profileData} 
                    onClose={() => setIsAdminPanelOpen(false)} 
                    onDelete={handleDeleteUser} 
                    onSuspend={handleSuspendUser} 
                    onRestore={handleRestoreUser} 
                />
            )}
        </div>
    );
};

export default ProfilePage;