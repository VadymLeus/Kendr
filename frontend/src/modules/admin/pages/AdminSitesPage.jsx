// frontend/src/modules/admin/pages/AdminSitesPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../../shared/ui/elements/Button';
import Avatar from '../../../shared/ui/elements/Avatar';
import CustomSelect from '../../../shared/ui/elements/CustomSelect';
import AdminPageLayout from '../components/AdminPageLayout';
import SiteDetailsPanel from '../components/SiteDetailsPanel';
import ConfirmModal from '../../../shared/ui/complex/ConfirmModal';
import { Input } from '../../../shared/ui/elements/Input'; 
import { AdminTable, AdminTh, AdminRow, AdminCell, LoadingRow, EmptyRow, FilterBar, GenericBadge } from '../components/AdminTableComponents';
import apiClient from '../../../shared/api/api';
import { useDataList } from '../../../shared/hooks/useDataList';
import { useConfirmDialog } from '../../../shared/hooks/useConfirmDialog';
import { Globe, Settings, AlertTriangle, ShieldAlert, CheckCircle, Ban, Clock, Minus, Inbox, Search, Eye } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Всі статуси', icon: Inbox },
    { value: 'published', label: 'Активні', icon: CheckCircle },
    { value: 'probation', label: 'Модерація', icon: ShieldAlert },
    { value: 'suspended', label: 'Заблоковані', icon: Ban },
    { value: 'draft', label: 'Чернетки', icon: Clock }
];

const StatusBadge = ({ status }) => {
    const config = {
        published: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Активний', icon: CheckCircle },
        suspended: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Заблоковано', icon: Ban },
        probation: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', label: 'Модерація', icon: ShieldAlert },
        draft: { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', label: 'Чернетка', icon: Clock },
    };
    const style = config[status] || config.draft;
    
    return (
        <GenericBadge bg={style.bg} color={style.color} icon={style.icon}>
            {style.label}
        </GenericBadge>
    );
};

const AppealIndicator = ({ status }) => (status === 'pending' ? (
    <GenericBadge bg="rgba(59, 130, 246, 0.1)" color="#3b82f6" icon={ShieldAlert}>
        Запит
    </GenericBadge>
) : (
    <div style={{ opacity: 0.2, display: 'flex', justifyContent: 'center' }}>
        <Minus size={16} />
    </div>
));

const AdminSitesPage = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('list');
    const [selectedSite, setSelectedSite] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const { filteredData: rawSites, loading, searchQuery, setSearchQuery, refresh } = useDataList('/admin/sites', ['title', 'site_path', 'author', 'author_email']);
    const { isOpen, config, requestConfirm, close } = useConfirmDialog();
    const processedSites = useMemo(() => {
        let result = [...rawSites];
        if (statusFilter !== 'all') result = result.filter(site => site.status === statusFilter);
        result.sort((a, b) => {
            const aVal = a[sortConfig.key] || '';
            const bVal = b[sortConfig.key] || '';
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return result;
    }, [rawSites, statusFilter, sortConfig]);

    const handleSort = (key) => setSortConfig(c => ({ key, direction: c.key === key && c.direction === 'desc' ? 'asc' : 'desc' }));

    const handleAction = async (actionFn) => {
        try {
            const res = await actionFn();
            toast.success(res?.data?.message || 'Успішно');
            close();
            setSelectedSite(null);
            refresh();
        } catch (e) { console.error(e); }
    };

    const actions = {
        suspend: (path) => requestConfirm({ title: 'Призупинити сайт?', message: 'Сайт стане недоступним.', type: 'warning', confirmLabel: 'Призупинити', onConfirm: () => handleAction(() => apiClient.post(`/admin/sites/${path}/suspend`)) }),
        restore: (path) => requestConfirm({ title: 'Відновити сайт?', message: 'Сайт стане публічним.', type: 'success', confirmLabel: 'Відновити', onConfirm: () => handleAction(() => apiClient.post(`/admin/sites/${path}/restore`)) }),
        probation: (path) => requestConfirm({ title: 'Випробувальний термін?', message: 'Доступ тільки для редагування.', type: 'warning', confirmLabel: 'Надати', onConfirm: () => handleAction(() => apiClient.post(`/admin/sites/${path}/probation`)) }),
        delete: (path) => requestConfirm({ title: 'Видалити назавжди?', message: 'Всі дані будуть стерті.', type: 'danger', confirmLabel: 'Видалити', onConfirm: () => handleAction(() => apiClient.delete(`/admin/sites/${path}`)) })
    };

    return (
        <AdminPageLayout 
            title="Сайти" icon={Globe} count={processedSites.length} 
            viewMode={viewMode} setViewMode={setViewMode} 
            onRefresh={refresh} loading={loading}
        >
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <FilterBar>
                    <div style={{ width: '220px' }}>
                        <CustomSelect 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)} 
                            options={STATUS_OPTIONS} 
                            variant="minimal" 
                            placeholder="Фільтр статусу" 
                            style={{ height: '36px', background: 'var(--platform-card-bg)' }} 
                        />
                    </div>
                </FilterBar>

                <div style={{ width: '300px' }}>
                    <Input 
                        placeholder="Пошук (назва, автор, URL)..."
                        leftIcon={<Search size={16}/>}
                        value={searchQuery || ''} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                        wrapperStyle={{margin: 0}}
                    />
                </div>
            </div>

            {viewMode === 'list' ? (
                <AdminTable>
                    <colgroup>
                        <col style={{width: '30%'}} />
                        <col style={{width: '20%'}} />
                        <col style={{width: '10%'}} /> 
                        <col style={{width: '15%'}} />
                        <col style={{width: '10%'}} />
                        <col style={{width: '80px'}} />
                    </colgroup>
                    <thead>
                        <tr>
                            <AdminTh label="Назва / URL" sortKey="title" currentSort={sortConfig} onSort={handleSort} />
                            <AdminTh label="Автор" sortKey="author" currentSort={sortConfig} onSort={handleSort} />
                            <AdminTh label="Перегляди" sortKey="view_count" currentSort={sortConfig} onSort={handleSort} />
                            <AdminTh label="Статус" sortKey="status" currentSort={sortConfig} onSort={handleSort} />
                            <AdminTh label="Апеляція" sortKey="appeal_status" currentSort={sortConfig} onSort={handleSort} align="center" />
                            <AdminTh label="Дії" align="right" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <LoadingRow cols={6} />
                        ) : processedSites.length === 0 ? (
                            <EmptyRow cols={6} message="Сайтів не знайдено" />
                        ) : (
                            processedSites.map(site => (
                                <AdminRow 
                                    key={site.id} 
                                    onClick={() => setSelectedSite(site)} 
                                    isSelected={selectedSite?.id === site.id} 
                                    style={{background: site.status === 'suspended' ? 'rgba(239, 68, 68, 0.02)' : undefined}}
                                >
                                    <AdminCell>
                                        <div style={{fontWeight: '600', fontSize: '15px'}}>{site.title}</div>
                                        <div style={{fontSize: '13px', color: 'var(--platform-accent)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px'}}>
                                            <Globe size={12}/> /{site.site_path}
                                        </div>
                                    </AdminCell>

                                    <AdminCell>
                                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                            <div onClick={(e) => {e.stopPropagation(); navigate(`/profile/${site.author}`)}} className="hover:opacity-80 cursor-pointer">
                                                <Avatar url={site.author_avatar_url} name={site.author} size={36} />
                                            </div>
                                            <div style={{minWidth: 0}}>
                                                <div style={{fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis'}}>{site.author}</div>
                                                <div style={{fontSize: '12px', opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis'}}>{site.author_email}</div>
                                                {site.warning_count > 0 && (
                                                    <div style={{fontSize: '11px', color: 'var(--platform-danger)', marginTop: '2px', fontWeight: '600', display:'flex', alignItems:'center', gap:'4px'}}>
                                                        <AlertTriangle size={10} /> {site.warning_count} страйк(ів)
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </AdminCell>

                                    <AdminCell>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.7}}>
                                            <Eye size={14} />
                                            <span style={{fontWeight: 500}}>{site.view_count || 0}</span>
                                        </div>
                                    </AdminCell>

                                    <AdminCell>
                                        <StatusBadge status={site.status} />
                                    </AdminCell>

                                    <AdminCell align="center">
                                        <AppealIndicator status={site.appeal_status} />
                                    </AdminCell>

                                    <AdminCell align="right" style={{overflow: 'visible'}}>
                                        <Button variant="ghost" style={{padding: '6px'}}>
                                            <Settings size={18} color="var(--platform-text-secondary)" />
                                        </Button>
                                    </AdminCell>
                                </AdminRow>
                            ))
                        )}
                    </tbody>
                </AdminTable>
            ) : (
                <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 4px 20px 0' }}>
                     <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--platform-text-secondary)' }}>
                        Режим сітки в розробці
                     </div>
                </div>
            )}

            <SiteDetailsPanel site={selectedSite} onClose={() => setSelectedSite(null)} actions={actions} />
            <ConfirmModal isOpen={isOpen} {...config} onCancel={close} />
        </AdminPageLayout>
    );
};

export default AdminSitesPage;