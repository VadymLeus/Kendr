// frontend/src/modules/admin/pages/AdminSitesPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/ui/elements/Button';
import Avatar from '../../../shared/ui/elements/Avatar';
import { toast } from 'react-toastify';
import AdminPageLayout from '../components/AdminPageLayout';
import SiteDetailsPanel from '../components/SiteDetailsPanel';
import ConfirmModal from '../../../shared/ui/complex/ConfirmModal';
import { useDataList } from '../../../shared/hooks/useDataList';
import { useConfirmDialog } from '../../../shared/hooks/useConfirmDialog';
import apiClient from '../../../shared/api/api';
import { Globe, Settings, AlertTriangle, User, ShieldAlert, CheckCircle, Ban, Clock, Minus } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const config = {
        published: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Активний', icon: CheckCircle },
        suspended: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Бан', icon: Ban },
        probation: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', label: 'Модерація', icon: ShieldAlert },
        draft: { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', label: 'Чернетка', icon: Clock },
    };
    const style = config[status] || config.draft;
    const Icon = style.icon;
    return (
        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', background: style.bg, color: style.color, display: 'inline-flex', alignItems: 'center', gap: '4px', border: `1px solid ${style.color}20` }}>
            <Icon size={10} /> {style.label}
        </span>
    );
};

const AppealIndicator = ({ status }) => (status === 'pending' ? (
    <div title="Є запит" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <ShieldAlert size={12} /> <span>Запит</span>
    </div>
) : <div style={{ opacity: 0.2, display: 'flex', justifyContent: 'center' }}><Minus size={16} /></div>);

const AdminSitesPage = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('list');
    const [selectedSite, setSelectedSite] = useState(null);
    const { 
        filteredData: sites, loading, searchQuery, setSearchQuery, refresh 
    } = useDataList('/admin/sites', ['title', 'site_path', 'author', 'author_email']);

    const { isOpen, config, requestConfirm, close } = useConfirmDialog();
    const handleAction = async (actionFn) => {
        try {
            const res = await actionFn();
            if (res?.data?.action === 'USER_DELETED') toast.info(res.data.message);
            else toast.success(res.data.message);
            close();
            setSelectedSite(null);
            refresh();
        } catch (e) { console.error(e); }
    };

    const handleVisitProfile = (e, username) => {
        e.stopPropagation();
        navigate(`/profile/${username}`);
    };

    const actions = {
        suspend: (path) => requestConfirm({
            title: 'Призупинити сайт?', message: 'Сайт стане недоступним. Власник отримає страйк.', type: 'warning', confirmLabel: 'Призупинити',
            onConfirm: () => handleAction(() => apiClient.post(`/admin/sites/${path}/suspend`))
        }),
        restore: (path) => requestConfirm({
            title: 'Відновити сайт?', message: 'Сайт знову стане публічним.', type: 'success', confirmLabel: 'Відновити',
            onConfirm: () => handleAction(() => apiClient.post(`/admin/sites/${path}/restore`))
        }),
        probation: (path) => requestConfirm({
            title: 'Випробувальний термін?', message: 'Доступ тільки для редагування.', type: 'warning', confirmLabel: 'Надати доступ',
            onConfirm: () => handleAction(() => apiClient.post(`/admin/sites/${path}/probation`))
        }),
        delete: (path) => requestConfirm({
            title: 'Видалити назавжди?', message: 'Всі дані будуть стерті. Це може призвести до бану користувача.', type: 'danger', confirmLabel: 'Видалити',
            onConfirm: () => handleAction(() => apiClient.delete(`/admin/sites/${path}`))
        })
    };

    const tableStyles = useMemo(() => ({
        card: { background: 'var(--platform-card-bg)', borderRadius: '16px', border: '1px solid var(--platform-border-color)', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%' },
        wrapper: { flex: 1, overflowY: 'auto', width: '100%' },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '15px', tableLayout: 'fixed' },
        th: { textAlign: 'left', padding: '16px 20px', background: 'var(--platform-bg)', color: 'var(--platform-text-secondary)', fontWeight: '600', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--platform-border-color)', whiteSpace: 'nowrap' },
        td: { padding: '16px 20px', borderBottom: '1px solid var(--platform-border-color)', color: 'var(--platform-text-primary)', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
        row: { cursor: 'pointer', transition: 'background 0.2s' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', overflowY: 'auto', paddingBottom: '20px', width: '100%' },
        cardItem: { background: 'var(--platform-card-bg)', borderRadius: '16px', border: '1px solid var(--platform-border-color)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer', transition: 'all 0.2s' }
    }), []);

    return (
        <AdminPageLayout 
            title="Сайти" icon={Globe} count={sites.length} 
            searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
            viewMode={viewMode} setViewMode={setViewMode} 
            onRefresh={refresh} loading={loading}
            searchPlaceholder="Пошук (назва, url, автор)..."
        >
            {viewMode === 'list' ? (
                <div style={tableStyles.card}>
                    <div style={tableStyles.wrapper} className="custom-scrollbar">
                        <table style={tableStyles.table}>
                            <colgroup><col style={{width: '35%'}} /><col style={{width: '25%'}} /><col style={{width: '15%'}} /><col style={{width: '10%'}} /><col style={{width: '80px'}} /></colgroup>
                            <thead>
                                <tr>
                                    <th style={tableStyles.th}>Назва сайту / URL</th>
                                    <th style={tableStyles.th}>Автор</th>
                                    <th style={tableStyles.th}>Статус</th>
                                    <th style={{...tableStyles.th, textAlign: 'center'}}>Апеляція</th>
                                    <th style={{...tableStyles.th, textAlign: 'right'}}>Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan="5" style={{padding:'24px', textAlign:'center', opacity:0.5}}>Завантаження...</td></tr>) : 
                                sites.length === 0 ? <tr><td colSpan="5" style={{padding:'40px', textAlign:'center', opacity:0.6}}>Сайтів не знайдено</td></tr> : 
                                sites.map(site => (
                                    <tr key={site.id} onClick={() => setSelectedSite(site)} className="hover:bg-(--platform-bg)"
                                        style={{...tableStyles.row, background: selectedSite?.id === site.id ? 'var(--platform-bg)' : site.status === 'suspended' ? 'rgba(239, 68, 68, 0.02)' : 'transparent', borderBottom: '1px solid var(--platform-border-color)'}}>
                                        <td style={tableStyles.td}>
                                            <div style={{fontWeight: '600', fontSize: '15px'}}>{site.title}</div>
                                            <div style={{fontSize: '13px', color: 'var(--platform-accent)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px'}}><Globe size={12}/> /{site.site_path}</div>
                                        </td>
                                        <td style={tableStyles.td}>
                                            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                                <div onClick={(e) => handleVisitProfile(e, site.author)} className="hover:opacity-80" style={{cursor: 'pointer'}}>
                                                    <Avatar url={site.author_avatar_url} name={site.author} size={36} />
                                                </div>
                                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                                    <div style={{fontWeight: '600'}}>{site.author}</div>
                                                    <div style={{fontSize: '12px', opacity: 0.6}}>{site.author_email}</div>
                                                    {site.warning_count > 0 && (
                                                        <div style={{fontSize: '11px', color: 'var(--platform-danger)', marginTop: '2px', fontWeight: '600', display:'flex', alignItems:'center', gap:'4px'}}>
                                                            <AlertTriangle size={10} /> {site.warning_count} страйк(ів)
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td style={tableStyles.td}><StatusBadge status={site.status} /></td>
                                        <td style={{...tableStyles.td, textAlign: 'center'}}><AppealIndicator status={site.appeal_status} /></td>
                                        <td style={{...tableStyles.td, textAlign: 'right', overflow: 'visible', padding: '0 12px'}}>
                                            <Button variant="ghost" style={{padding: '6px'}}>
                                                <Settings size={18} color="var(--platform-text-secondary)" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div style={tableStyles.grid} className="custom-scrollbar">
                    {loading ? <div>Завантаження...</div> : sites.map(site => (
                        <div key={site.id} onClick={() => setSelectedSite(site)} className="hover:shadow-md hover:border-(--platform-border-color-hover)"
                            style={{...tableStyles.cardItem, borderColor: selectedSite?.id === site.id ? 'var(--platform-accent)' : 'var(--platform-border-color)'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}><StatusBadge status={site.status} /><AppealIndicator status={site.appeal_status} /></div>
                            
                            <div style={{textAlign: 'center', margin: '10px 0'}}>
                                <div style={{fontWeight: 'bold', fontSize: '18px'}}>{site.title}</div>
                                <div style={{fontSize: '13px', color: 'var(--platform-accent)', fontFamily: 'monospace'}}>/{site.site_path}</div>
                            </div>
                            
                            <div style={{width: '100%', height: '1px', background: 'var(--platform-border-color)'}}></div>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <div onClick={(e) => handleVisitProfile(e, site.author)} className="hover:scale-110 transition-transform" style={{cursor: 'pointer'}}>
                                        <Avatar url={site.author_avatar_url} name={site.author} size={28} />
                                    </div>
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <div style={{fontSize: '13px', fontWeight: '500', color: 'var(--platform-text-primary)'}}>{site.author}</div>
                                    </div>
                                </div>
                                {site.warning_count > 0 && <div style={{color: 'var(--platform-danger)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px'}}><AlertTriangle size={12}/> {site.warning_count}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <SiteDetailsPanel site={selectedSite} onClose={() => setSelectedSite(null)} actions={actions} />
            <ConfirmModal isOpen={isOpen} title={config.title} message={config.message} confirmLabel={config.confirmLabel} cancelLabel={config.cancelLabel} type={config.type} onConfirm={config.onConfirm} onCancel={close} />
        </AdminPageLayout>
    );
};

export default AdminSitesPage;