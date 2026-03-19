// frontend/src/modules/admin/pages/AdminUsersSitesPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../../shared/ui/elements/Button';
import Avatar from '../../../shared/ui/elements/Avatar';
import CustomSelect from '../../../shared/ui/elements/CustomSelect';
import DateRangePicker from '../../../shared/ui/elements/DateRangePicker';
import AdminPageLayout from '../components/AdminPageLayout';
import UserDetailsPanel from '../components/UserDetailsPanel';
import SiteDetailsPanel from '../components/SiteDetailsPanel';
import { Input } from '../../../shared/ui/elements/Input';
import { AdminTable, AdminTh, AdminRow, AdminCell, LoadingRow, EmptyRow, FilterBar, GenericBadge, CsvExportButton } from '../components/AdminTableComponents';
import apiClient, { suspendUser, restoreUser } from '../../../shared/api/api';
import { useDataList } from '../../../shared/hooks/useDataList';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { exportToCsv } from '../../../shared/utils/exportToCsv';
import { Users, Settings, Layout, AlertTriangle, Smartphone, CheckCircle, Search, Ban, Globe, ShieldAlert, Clock, Minus, Inbox, Eye, UserX, Zap } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Всі', icon: Inbox }, 
    { value: 'published', label: 'Активні', icon: CheckCircle },
    { value: 'probation', label: 'Модерація', icon: ShieldAlert }, 
    { value: 'suspended', label: 'Заблоковані', icon: Ban }, 
    { value: 'draft', label: 'Чернетки', icon: Clock }
];

const STATUS_CONFIG = {
    published: { bg: 'color-mix(in srgb, var(--platform-success), transparent 90%)', color: 'var(--platform-success)', label: 'Активний', icon: CheckCircle },
    suspended: { bg: 'color-mix(in srgb, var(--platform-danger), transparent 90%)', color: 'var(--platform-danger)', label: 'Заблоковано', icon: Ban },
    probation: { bg: 'color-mix(in srgb, var(--platform-warning), transparent 90%)', color: 'var(--platform-warning)', label: 'Модерація', icon: ShieldAlert },
    draft: { bg: 'var(--platform-hover-bg)', color: 'var(--platform-text-secondary)', label: 'Чернетка', icon: Clock }
};

const AdminUsersSitesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get('tab') === 'sites' ? 'sites' : 'users';
    });
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('tab') !== activeTab) {
            navigate({ search: `?tab=${activeTab}` }, { replace: true });
        }
    }, [activeTab, navigate, location.search]);
    const [viewMode, setViewMode] = useState('list');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userSort, setUserSort] = useState({ key: 'created_at', direction: 'desc' });
    const [hideSuspendedUsers, setHideSuspendedUsers] = useState(true);
    const [userStartDate, setUserStartDate] = useState('');
    const [userEndDate, setUserEndDate] = useState('');
    const usersData = useDataList('/admin/users', ['username', 'email', 'id', 'phone_number', 'slug', 'plan']);
    const { confirm } = useConfirm();
    const processedUsers = useMemo(() => {
        let res = [...usersData.filteredData];
        if (hideSuspendedUsers) {
            res = res.filter(u => u.status !== 'suspended');
        }
        if (userStartDate) {
            const start = new Date(`${userStartDate}T00:00:00`);
            res = res.filter(u => new Date(u.created_at) >= start);
        }
        if (userEndDate) {
            const end = new Date(`${userEndDate}T23:59:59`);
            res = res.filter(u => new Date(u.created_at) <= end);
        }
        return res.sort((a, b) => {
            const valA = a[userSort.key] || '';
            const valB = b[userSort.key] || '';
            return (valA < valB ? -1 : 1) * (userSort.direction === 'asc' ? 1 : -1);
        });
    }, [usersData.filteredData, userSort, hideSuspendedUsers, userStartDate, userEndDate]);
    const handleUserSort = (key) => setUserSort(c => ({ key, direction: c.key === key && c.direction === 'desc' ? 'asc' : 'desc' }));
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
                    setSelectedUser(null); 
                    usersData.refresh(); 
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
                    setSelectedUser(null); 
                    usersData.refresh(); 
                } catch (error) { toast.error(error.response?.data?.message || 'Помилка блокування'); } 
            } 
        });
    };

    const handleRestoreUser = (userId) => {
        confirm({ 
            title: 'Розблокувати акаунт?', 
            message: 'Користувач знову зможе користуватися платформою. Старі сайти не відновляться, але він зможе створити нові. Введіть "RESTORE" для підтвердження.', 
            type: 'success',
            requireInput: true,
            expectedInput: 'RESTORE',
            confirmText: 'Розблокувати',
            onConfirm: async (inputValue) => { 
                if (inputValue !== 'RESTORE') return toast.error('Невірне підтвердження.');
                try { 
                    await restoreUser(userId); 
                    toast.success('Користувача розблоковано'); 
                    setSelectedUser(null); 
                    usersData.refresh(); 
                } catch (error) { toast.error(error.response?.data?.message || 'Помилка розблокування'); } 
            } 
        });
    };
    const handleExportUsers = () => {
        if (!processedUsers?.length) return toast.info('Немає даних');
        exportToCsv(processedUsers.map(u => ({
            id: u.id, username: u.username, slug: u.slug || '-', email: u.email, phone: u.phone_number || '-', 
            plan: u.plan || 'FREE', role: u.role || 'user', status: u.status, is_verified: u.is_verified ? 'Так' : 'Ні', 
            sites: u.site_count || 0, warnings: u.warning_count || 0, 
            created: new Date(u.created_at).toLocaleString('uk-UA'),
            last_login: u.last_login_at ? new Date(u.last_login_at).toLocaleString('uk-UA') : 'Ніколи'
        })), { 
            id: 'ID', username: "Ім'я", slug: 'Slug', email: 'Email', phone: 'Телефон', plan: 'Тариф',
            role: 'Роль', status: 'Статус', is_verified: 'Верифікований', sites: 'Сайти', 
            warnings: 'Страйки', created: 'Дата реєстрації', last_login: 'Останній вхід' 
        }, `users_${new Date().toLocaleDateString('uk-UA')}`);
    };
    const [selectedSite, setSelectedSite] = useState(null);
    const [siteStatusFilter, setSiteStatusFilter] = useState('all');
    const [siteStartDate, setSiteStartDate] = useState('');
    const [siteEndDate, setSiteEndDate] = useState('');
    const [siteSort, setSiteSort] = useState({ key: 'created_at', direction: 'desc' });
    const sitesData = useDataList('/admin/sites', ['title', 'site_path', 'author', 'author_email']);
    const processedSites = useMemo(() => {
        let res = siteStatusFilter !== 'all' ? sitesData.filteredData.filter(s => s.status === siteStatusFilter) : [...sitesData.filteredData];
        if (siteStartDate) {
            const start = new Date(`${siteStartDate}T00:00:00`);
            res = res.filter(s => new Date(s.created_at) >= start);
        }
        if (siteEndDate) {
            const end = new Date(`${siteEndDate}T23:59:59`);
            res = res.filter(s => new Date(s.created_at) <= end);
        }
        return res.sort((a, b) => (a[siteSort.key] < b[siteSort.key] ? -1 : 1) * (siteSort.direction === 'asc' ? 1 : -1));
    }, [sitesData.filteredData, siteStatusFilter, siteSort, siteStartDate, siteEndDate]);
    const handleSiteSort = (key) => setSiteSort(c => ({ key, direction: c.key === key && c.direction === 'desc' ? 'asc' : 'desc' }));
    const handleSiteAction = async (fn) => { 
        try { 
            const res = await fn(); 
            toast.success(res?.data?.message || 'Успішно'); 
            setSelectedSite(null); 
            sitesData.refresh(); 
        } catch { console.error('Error'); } 
    };
    const siteActions = {
        suspend: (path) => confirm({ 
            title: 'Призупинити сайт?', 
            message: 'Сайт стане недоступним. Власник отримає 1 страйк. Введіть "SUSPEND" для підтвердження.', 
            type: 'warning', 
            confirmText: 'Призупинити', 
            requireInput: true,
            expectedInput: 'SUSPEND',
            onConfirm: async (inputValue) => {
                if (inputValue !== 'SUSPEND') return toast.error('Невірне підтвердження.');
                handleSiteAction(() => apiClient.post(`/admin/sites/${path}/suspend`));
            }
        }),
        restore: (path) => confirm({ 
            title: 'Відновити?', 
            message: 'Сайт стане публічним. Введіть "RESTORE" для підтвердження.', 
            type: 'success', 
            confirmText: 'Відновити', 
            requireInput: true,
            expectedInput: 'RESTORE',
            onConfirm: async (inputValue) => {
                if (inputValue !== 'RESTORE') return toast.error('Невірне підтвердження.');
                handleSiteAction(() => apiClient.post(`/admin/sites/${path}/restore`));
            }
        }),
        probation: (path) => confirm({ 
            title: 'Випробувальний термін?', 
            message: 'Сайт буде доступний тільки для редагування. Введіть "PROBATION" для підтвердження.', 
            type: 'warning', 
            confirmText: 'Надати', 
            requireInput: true,
            expectedInput: 'PROBATION',
            onConfirm: async (inputValue) => {
                if (inputValue !== 'PROBATION') return toast.error('Невірне підтвердження.');
                handleSiteAction(() => apiClient.post(`/admin/sites/${path}/probation`));
            }
        }),
        delete: (path) => confirm({ 
            title: 'Видалити остаточно?', 
            message: 'Ця дія незворотна. Всі дані сайту будуть стерті. Введіть "DELETE" для підтвердження.', 
            danger: true, 
            confirmText: 'Видалити', 
            requireInput: true,
            expectedInput: 'DELETE',
            onConfirm: async (inputValue) => {
                if (inputValue !== 'DELETE') return toast.error('Невірне підтвердження.');
                handleSiteAction(() => apiClient.delete(`/admin/sites/${path}`));
            }
        })
    };
    const handleExportSites = () => {
        if (!processedSites?.length) return toast.info('Немає даних');
        exportToCsv(processedSites.map(s => ({
            id: s.id, title: s.title, url: s.site_path, author: s.author, email: s.author_email, views: s.view_count || 0,
            status: STATUS_OPTIONS.find(o => o.value === s.status)?.label || s.status, appeal: s.appeal_status === 'pending' ? 'Є запит' : '-', created: new Date(s.created_at).toLocaleString('uk-UA')
        })), { id: 'ID', title: 'Назва', url: 'URL', author: 'Власник', email: 'Email', views: 'Перегляди', status: 'Статус', appeal: 'Апеляція', created: 'Дата' }, `sites_${new Date().toLocaleDateString('uk-UA')}`);
    };
    const currentDataLoading = activeTab === 'users' ? usersData.loading : sitesData.loading;
    const currentDataRefresh = activeTab === 'users' ? usersData.refresh : sitesData.refresh;
    const currentCount = activeTab === 'users' ? processedUsers.length : processedSites.length;
    return (
        <AdminPageLayout 
            title="Користувачі / Сайти" 
            icon={Users} 
            count={currentCount} 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
            onRefresh={currentDataRefresh} 
            loading={currentDataLoading}
        >
            <div className="flex p-1 bg-(--platform-bg) rounded-xl border border-(--platform-border-color) w-fit mb-6">
                <button
                    className={`py-2 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'users' ? 'bg-(--platform-card-bg) text-(--platform-text-primary) shadow-sm' : 'text-(--platform-text-secondary) hover:text-(--platform-text-primary)'}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={16} /> Користувачі
                </button>
                <button
                    className={`py-2 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'sites' ? 'bg-(--platform-card-bg) text-(--platform-text-primary) shadow-sm' : 'text-(--platform-text-secondary) hover:text-(--platform-text-primary)'}`}
                    onClick={() => setActiveTab('sites')}
                >
                    <Globe size={16} /> Сайти
                </button>
            </div>
            {activeTab === 'users' && (
                <>
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <FilterBar>
                            <DateRangePicker 
                                startDate={userStartDate}
                                endDate={userEndDate}
                                onStartDateChange={setUserStartDate}
                                onEndDateChange={setUserEndDate}
                                onClear={() => { setUserStartDate(''); setUserEndDate(''); }}
                            />
                        </FilterBar>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button 
                                type="button"
                                onClick={() => setHideSuspendedUsers(!hideSuspendedUsers)} 
                                title={hideSuspendedUsers ? "Показати заблоковані акаунти" : "Приховати заблоковані акаунти"} 
                                className={`h-10 w-10 flex items-center justify-center shrink-0 rounded-lg border transition-all cursor-pointer ${
                                    hideSuspendedUsers 
                                        ? 'border-red-500 text-red-500 bg-red-500/10' 
                                        : 'border-(--platform-border-color) bg-transparent text-(--platform-text-secondary) hover:border-red-500 hover:text-red-500'
                                }`}
                            >
                                <UserX size={20} strokeWidth={2.5} />
                            </button>
                            <div style={{ width: '260px' }}><Input placeholder="Пошук користувачів..." leftIcon={<Search size={16}/>} value={usersData.searchQuery || ''} onChange={(e) => usersData.setSearchQuery(e.target.value)} wrapperStyle={{margin: 0}} /></div>
                            <CsvExportButton onClick={handleExportUsers} disabled={usersData.loading || !processedUsers.length} />
                        </div>
                    </div>
                    {viewMode === 'list' ? (
                        <AdminTable>
                            <colgroup>
                                <col style={{width: '60px'}} />
                                <col style={{width: '18%'}} />
                                <col style={{width: '12%'}} />
                                <col style={{width: '18%'}} />
                                <col style={{width: '10%'}} />
                                <col style={{width: '12%'}} />
                                <col style={{width: '10%'}} />
                                <col style={{width: '15%'}} />
                                <col style={{width: '60px'}} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <AdminTh label="ID" sortKey="id" currentSort={userSort} onSort={handleUserSort} />
                                    <AdminTh label="Користувач" sortKey="username" currentSort={userSort} onSort={handleUserSort} />
                                    <AdminTh label="Slug" sortKey="slug" currentSort={userSort} onSort={handleUserSort} />
                                    <AdminTh label="Email" sortKey="email" currentSort={userSort} onSort={handleUserSort} />
                                    <AdminTh label="Тариф" sortKey="plan" currentSort={userSort} onSort={handleUserSort} />
                                    <AdminTh label="Телефон" sortKey="phone_number" currentSort={userSort} onSort={handleUserSort} />
                                    <AdminTh label="Ресурси" sortKey="site_count" currentSort={userSort} onSort={handleUserSort} />
                                    <AdminTh label="Активність" sortKey="created_at" currentSort={userSort} onSort={handleUserSort} />
                                    <AdminTh label="Дії" align="right" />
                                </tr>
                            </thead>
                            <tbody>
                                {usersData.loading ? <LoadingRow cols={9} /> : !processedUsers.length ? <EmptyRow cols={9} /> : processedUsers.map(u => (
                                    <AdminRow key={u.id} onClick={() => setSelectedUser(u)} isSelected={selectedUser?.id === u.id}>
                                        <AdminCell style={{opacity: 0.6}}>#{u.id}</AdminCell>
                                        <AdminCell>
                                            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                                <div onClick={(e)=>{e.stopPropagation(); if(u.status !== 'suspended') navigate(`/profile/${u.slug || u.username}`)}} className="hover:opacity-80 cursor-pointer">
                                                    <Avatar url={u.avatar_url} name={u.username} size={36} />
                                                </div>
                                                <div>
                                                    <div 
                                                        onClick={(e) => { e.stopPropagation(); if (u.status !== 'suspended') navigate(`/profile/${u.slug || u.username}`); }}
                                                        style={{
                                                            fontWeight: '600', 
                                                            color: u.status === 'suspended' ? 'var(--platform-danger)' : 'var(--platform-text-primary)',
                                                            cursor: u.status === 'suspended' ? 'default' : 'pointer',
                                                            transition: 'color 0.2s',
                                                            display: 'inline-block'
                                                        }}
                                                        onMouseEnter={e => { if(u.status !== 'suspended') e.currentTarget.style.color = 'var(--platform-accent)' }}
                                                        onMouseLeave={e => { if(u.status !== 'suspended') e.currentTarget.style.color = 'var(--platform-text-primary)' }}
                                                    >
                                                        {u.username}
                                                    </div>
                                                    {u.status === 'suspended' && <span style={{marginLeft: '8px', fontSize: '10px', background: 'var(--platform-danger)', color: 'white', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle', fontWeight: 'bold'}}>BLOCKED</span>}
                                                    {u.is_verified && u.status !== 'suspended' && <div style={{fontSize: '11px', color: 'var(--platform-success)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px'}}><CheckCircle size={10}/> Verified</div>}
                                                </div>
                                            </div>
                                        </AdminCell>
                                        <AdminCell>
                                            <div style={{fontSize: '13px', fontFamily: u.slug ? 'monospace' : 'inherit'}}>
                                                {u.slug ? <span style={{color: 'var(--platform-text-secondary)'}}>@{u.slug}</span> : <span style={{opacity: 0.5}}>-</span>}
                                            </div>
                                        </AdminCell>
                                        <AdminCell>
                                            <div style={{fontSize: '13px'}}>
                                                <div style={{textDecoration: u.status === 'suspended' ? 'line-through' : 'none', opacity: u.status === 'suspended' ? 0.5 : 1}}>{u.email}</div>
                                            </div>
                                        </AdminCell>
                                        <AdminCell>
                                            <div style={{
                                                fontSize: '11px', 
                                                fontWeight: 'bold', 
                                                padding: '2px 8px', 
                                                borderRadius: '12px', 
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                backgroundColor: u.plan === 'PLUS' ? 'var(--platform-accent)' : 'var(--platform-bg)',
                                                color: u.plan === 'PLUS' ? '#fff' : 'var(--platform-text-secondary)',
                                                border: u.plan === 'PLUS' ? 'none' : '1px solid var(--platform-border-color)'
                                            }}>
                                                {u.plan === 'PLUS' && <Zap size={10} />}
                                                {u.plan || 'FREE'}
                                            </div>
                                        </AdminCell>
                                        <AdminCell>
                                            <div style={{fontSize: '13px', color: 'var(--platform-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px'}}>
                                                {u.phone_number ? <><Smartphone size={12}/> {u.phone_number}</> : <span style={{opacity: 0.5}}>-</span>}
                                            </div>
                                        </AdminCell>
                                        <AdminCell>
                                            <div style={{display: 'flex', gap: '16px'}}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'}}>
                                                    <Layout size={14} color="var(--platform-text-secondary)" /> {u.status === 'suspended' ? 0 : u.site_count}
                                                </div>
                                                {u.warning_count > 0 && (
                                                    <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--platform-danger)'}}>
                                                        <AlertTriangle size={14} /> {u.warning_count}
                                                    </div>
                                                )}
                                            </div>
                                        </AdminCell>
                                        <AdminCell>
                                            <div style={{fontSize: '13px', color: 'var(--platform-text-primary)'}}>Реєстрація: {new Date(u.created_at).toLocaleDateString()}</div>
                                            {u.last_login_at ? (
                                                <div style={{fontSize: '12px', color: 'var(--platform-text-secondary)', marginTop: '2px'}}>Вхід: {new Date(u.last_login_at).toLocaleDateString()}</div>
                                            ) : (
                                                <div style={{fontSize: '12px', color: 'var(--platform-text-secondary)', marginTop: '2px'}}>Вхід: Ніколи</div>
                                            )}
                                        </AdminCell>
                                        <AdminCell align="right" style={{overflow: 'visible'}}>
                                            <Button variant="ghost" style={{padding: '6px'}}><Settings size={18} color="var(--platform-text-secondary)" /></Button>
                                        </AdminCell>
                                    </AdminRow>
                                ))}
                            </tbody>
                        </AdminTable>
                    ) : <div style={{ padding: '40px', textAlign: 'center', color: 'var(--platform-text-secondary)' }}>Режим сітки в розробці</div>}
                </>
            )}
            {activeTab === 'sites' && (
                <>
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <FilterBar>
                            <div style={{ width: '180px' }}>
                                <CustomSelect value={siteStatusFilter} onChange={(e) => setSiteStatusFilter(e.target.value)} options={STATUS_OPTIONS} variant="minimal" placeholder="Статус" style={{ height: '36px', background: 'var(--platform-card-bg)' }} />
                            </div>
                            <DateRangePicker 
                                startDate={siteStartDate}
                                endDate={siteEndDate}
                                onStartDateChange={setSiteStartDate}
                                onEndDateChange={setSiteEndDate}
                                onClear={() => { setSiteStartDate(''); setSiteEndDate(''); }}
                            />
                        </FilterBar>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: '260px' }}><Input placeholder="Пошук сайтів..." leftIcon={<Search size={16}/>} value={sitesData.searchQuery || ''} onChange={(e) => sitesData.setSearchQuery(e.target.value)} wrapperStyle={{margin: 0}} /></div>
                            <CsvExportButton onClick={handleExportSites} disabled={sitesData.loading || !processedSites.length} />
                        </div>
                    </div>
                    {viewMode === 'list' ? (
                        <AdminTable>
                            <colgroup><col style={{width: '30%'}} /><col style={{width: '20%'}} /><col style={{width: '10%'}} /><col style={{width: '15%'}} /><col style={{width: '10%'}} /><col style={{width: '80px'}} /></colgroup>
                            <thead><tr><AdminTh label="Назва" sortKey="title" currentSort={siteSort} onSort={handleSiteSort} /><AdminTh label="Автор" sortKey="author" currentSort={siteSort} onSort={handleSiteSort} /><AdminTh label="Перегляди" sortKey="view_count" currentSort={siteSort} onSort={handleSiteSort} /><AdminTh label="Статус" sortKey="status" currentSort={siteSort} onSort={handleSiteSort} /><AdminTh label="Апеляція" sortKey="appeal_status" currentSort={siteSort} onSort={handleSiteSort} align="center" /><AdminTh label="Дії" align="right" /></tr></thead>
                            <tbody>
                                {sitesData.loading ? <LoadingRow cols={6} /> : !processedSites.length ? <EmptyRow cols={6} /> : processedSites.map(site => {
                                    const st = STATUS_CONFIG[site.status] || STATUS_CONFIG.draft;
                                    return (
                                        <AdminRow key={site.id} onClick={() => setSelectedSite(site)} isSelected={selectedSite?.id === site.id} style={{background: site.status === 'suspended' ? 'color-mix(in srgb, var(--platform-danger), transparent 98%)' : undefined}}>
                                            <AdminCell>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                                    <Avatar url={site.logo_url} name={site.title} size={36} />
                                                    <div>
                                                        <div style={{fontWeight: '600', fontSize: '15px'}}>{site.title}</div>
                                                        <div style={{fontSize: '13px', color: 'var(--platform-accent)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px'}}><Globe size={12}/> /{site.site_path}</div>
                                                    </div>
                                                </div>
                                            </AdminCell>
                                            <AdminCell>
                                                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                                    <div onClick={(e)=>{e.stopPropagation();navigate(`/profile/${site.author_slug || site.author}`)}} className="hover:opacity-80 cursor-pointer">
                                                        <Avatar url={site.author_avatar_url || site.avatar_url} name={site.author} size={36} />
                                                    </div>
                                                    <div style={{minWidth: 0}}>
                                                        <div 
                                                            onClick={(e)=>{e.stopPropagation(); navigate(`/profile/${site.author_slug || site.author}`)}}
                                                            style={{
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                transition: 'color 0.2s',
                                                                color: 'var(--platform-text-primary)',
                                                                display: 'inline-block'
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.color = 'var(--platform-accent)'}
                                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--platform-text-primary)'}
                                                        >
                                                            {site.author}
                                                        </div>
                                                        <div style={{fontSize: '12px', opacity: 0.6}}>{site.author_email}</div>
                                                        {site.warning_count > 0 && <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--platform-danger)', fontWeight: '600'}}><AlertTriangle size={10} /> {site.warning_count} страйк(ів)</div>}
                                                    </div>
                                                </div>
                                            </AdminCell>
                                            <AdminCell><div style={{display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.7}}><Eye size={14} /><span style={{fontWeight: 500}}>{site.view_count || 0}</span></div></AdminCell>
                                            <AdminCell><GenericBadge bg={st.bg} color={st.color} icon={st.icon}>{st.label}</GenericBadge></AdminCell>
                                            <AdminCell align="center">{site.appeal_status === 'pending' ? <GenericBadge bg="color-mix(in srgb, var(--platform-accent), transparent 90%)" color="var(--platform-accent)" icon={ShieldAlert}>Запит</GenericBadge> : <Minus size={16} style={{opacity:0.2}}/>}</AdminCell>
                                            <AdminCell align="right" style={{overflow: 'visible'}}><Button variant="ghost" style={{padding: '6px'}}><Settings size={18} color="var(--platform-text-secondary)" /></Button></AdminCell>
                                        </AdminRow>
                                    );
                                })}
                            </tbody>
                        </AdminTable>
                    ) : <div style={{ padding: '40px', textAlign: 'center', color: 'var(--platform-text-secondary)' }}>Режим сітки в розробці</div>}
                </>
            )}
            <UserDetailsPanel user={selectedUser} onClose={() => setSelectedUser(null)} onDelete={handleDeleteUser} onSuspend={handleSuspendUser} onRestore={handleRestoreUser} />
            <SiteDetailsPanel site={selectedSite} onClose={() => setSelectedSite(null)} actions={siteActions} />
        </AdminPageLayout>
    );
};

export default AdminUsersSitesPage;