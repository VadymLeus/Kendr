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
import { AdminTable, AdminTh, AdminRow, AdminCell, LoadingRow, EmptyRow, FilterBar, GenericBadge, CsvExportButton } from '../components/AdminTableComponents';
import apiClient from '../../../shared/api/api';
import { useDataList } from '../../../shared/hooks/useDataList';
import { useConfirmDialog } from '../../../shared/hooks/useConfirmDialog';
import { exportToCsv } from '../../../shared/utils/exportToCsv';
import { Globe, Settings, AlertTriangle, ShieldAlert, CheckCircle, Ban, Clock, Minus, Inbox, Search, Eye } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Всі', icon: Inbox }, { value: 'published', label: 'Активні', icon: CheckCircle },
    { value: 'probation', label: 'Модерація', icon: ShieldAlert }, { value: 'suspended', label: 'Бан', icon: Ban }, { value: 'draft', label: 'Чернетки', icon: Clock }
];
const STATUS_CONFIG = {
    published: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Активний', icon: CheckCircle },
    suspended: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Заблоковано', icon: Ban },
    probation: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', label: 'Модерація', icon: ShieldAlert },
    draft: { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', label: 'Чернетка', icon: Clock }
};

const AdminSitesPage = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('list');
    const [selectedSite, setSelectedSite] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const { filteredData: rawSites, loading, searchQuery, setSearchQuery, refresh } = useDataList('/admin/sites', ['title', 'site_path', 'author', 'author_email']);
    const { isOpen, config, requestConfirm, close } = useConfirmDialog();
    
    const processedSites = useMemo(() => {
        let res = statusFilter !== 'all' ? rawSites.filter(s => s.status === statusFilter) : [...rawSites];
        return res.sort((a, b) => (a[sortConfig.key] < b[sortConfig.key] ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1));
    }, [rawSites, statusFilter, sortConfig]);

    const handleSort = (key) => setSortConfig(c => ({ key, direction: c.key === key && c.direction === 'desc' ? 'asc' : 'desc' }));
    const handleAction = async (fn) => { try { const res = await fn(); toast.success(res?.data?.message || 'Успішно'); close(); setSelectedSite(null); refresh(); } catch { console.error('Error'); } };

    const actions = {
        suspend: (path) => requestConfirm({ title: 'Призупинити?', message: 'Сайт стане недоступним.', type: 'warning', confirmLabel: 'Призупинити', onConfirm: () => handleAction(() => apiClient.post(`/admin/sites/${path}/suspend`)) }),
        restore: (path) => requestConfirm({ title: 'Відновити?', message: 'Сайт стане публічним.', type: 'success', confirmLabel: 'Відновити', onConfirm: () => handleAction(() => apiClient.post(`/admin/sites/${path}/restore`)) }),
        probation: (path) => requestConfirm({ title: 'Випробувальний?', message: 'Тільки редагування.', type: 'warning', confirmLabel: 'Надати', onConfirm: () => handleAction(() => apiClient.post(`/admin/sites/${path}/probation`)) }),
        delete: (path) => requestConfirm({ title: 'Видалити?', message: 'Дані будуть стерті.', type: 'danger', confirmLabel: 'Видалити', onConfirm: () => handleAction(() => apiClient.delete(`/admin/sites/${path}`)) })
    };

    const handleExport = () => {
        if (!processedSites?.length) return toast.info('Немає даних');
        exportToCsv(processedSites.map(s => ({
            id: s.id, title: s.title, url: s.site_path, author: s.author, email: s.author_email, views: s.view_count || 0,
            status: STATUS_OPTIONS.find(o => o.value === s.status)?.label || s.status, appeal: s.appeal_status === 'pending' ? 'Є запит' : '-', created: new Date(s.created_at).toLocaleDateString('uk-UA')
        })), { id: 'ID', title: 'Назва', url: 'URL', author: 'Власник', email: 'Email', views: 'Перегляди', status: 'Статус', appeal: 'Апеляція', created: 'Дата' }, `sites_${new Date().toLocaleDateString('uk-UA')}`);
    };

    return (
        <AdminPageLayout title="Сайти" icon={Globe} count={processedSites.length} viewMode={viewMode} setViewMode={setViewMode} onRefresh={refresh} loading={loading}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <FilterBar><div style={{ width: '220px' }}><CustomSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={STATUS_OPTIONS} variant="minimal" placeholder="Статус" style={{ height: '36px', background: 'var(--platform-card-bg)' }} /></div></FilterBar>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '300px' }}><Input placeholder="Пошук..." leftIcon={<Search size={16}/>} value={searchQuery || ''} onChange={(e) => setSearchQuery(e.target.value)} wrapperStyle={{margin: 0}} /></div>
                    <CsvExportButton onClick={handleExport} disabled={loading || !processedSites.length} />
                </div>
            </div>
            {viewMode === 'list' ? (
                <AdminTable>
                    <colgroup><col style={{width: '30%'}} /><col style={{width: '20%'}} /><col style={{width: '10%'}} /><col style={{width: '15%'}} /><col style={{width: '10%'}} /><col style={{width: '80px'}} /></colgroup>
                    <thead><tr><AdminTh label="Назва" sortKey="title" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Автор" sortKey="author" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Перегляди" sortKey="view_count" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Статус" sortKey="status" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Апеляція" sortKey="appeal_status" currentSort={sortConfig} onSort={handleSort} align="center" /><AdminTh label="Дії" align="right" /></tr></thead>
                    <tbody>
                        {loading ? <LoadingRow cols={6} /> : !processedSites.length ? <EmptyRow cols={6} /> : processedSites.map(site => {
                            const st = STATUS_CONFIG[site.status] || STATUS_CONFIG.draft;
                            return (
                                <AdminRow key={site.id} onClick={() => setSelectedSite(site)} isSelected={selectedSite?.id === site.id} style={{background: site.status === 'suspended' ? 'rgba(239, 68, 68, 0.02)' : undefined}}>
                                    <AdminCell><div style={{fontWeight: '600', fontSize: '15px'}}>{site.title}</div><div style={{fontSize: '13px', color: 'var(--platform-accent)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px'}}><Globe size={12}/> /{site.site_path}</div></AdminCell>
                                    <AdminCell><div style={{display:'flex', alignItems:'center', gap:'12px'}}><div onClick={(e)=>{e.stopPropagation();navigate(`/profile/${site.author}`)}} className="hover:opacity-80 cursor-pointer"><Avatar url={site.author_avatar_url} name={site.author} size={36} /></div><div style={{minWidth: 0}}><div style={{fontWeight: '600'}}>{site.author}</div><div style={{fontSize: '12px', opacity: 0.6}}>{site.author_email}</div>{site.warning_count > 0 && <div style={{fontSize: '11px', color: 'var(--platform-danger)', fontWeight: '600'}}><AlertTriangle size={10} /> {site.warning_count} страйк(ів)</div>}</div></div></AdminCell>
                                    <AdminCell><div style={{display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.7}}><Eye size={14} /><span style={{fontWeight: 500}}>{site.view_count || 0}</span></div></AdminCell>
                                    <AdminCell><GenericBadge bg={st.bg} color={st.color} icon={st.icon}>{st.label}</GenericBadge></AdminCell>
                                    <AdminCell align="center">{site.appeal_status === 'pending' ? <GenericBadge bg="rgba(59, 130, 246, 0.1)" color="#3b82f6" icon={ShieldAlert}>Запит</GenericBadge> : <Minus size={16} style={{opacity:0.2}}/>}</AdminCell>
                                    <AdminCell align="right" style={{overflow: 'visible'}}><Button variant="ghost" style={{padding: '6px'}}><Settings size={18} color="var(--platform-text-secondary)" /></Button></AdminCell>
                                </AdminRow>
                            );
                        })}
                    </tbody>
                </AdminTable>
            ) : <div style={{ padding: '40px', textAlign: 'center', color: 'var(--platform-text-secondary)' }}>Режим сітки в розробці</div>}
            <SiteDetailsPanel site={selectedSite} onClose={() => setSelectedSite(null)} actions={actions} />
            <ConfirmModal isOpen={isOpen} {...config} onCancel={close} />
        </AdminPageLayout>
    );
};
export default AdminSitesPage;