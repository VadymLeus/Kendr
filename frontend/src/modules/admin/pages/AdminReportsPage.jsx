// frontend/src/modules/admin/pages/AdminReportsPage.jsx
import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../../../shared/ui/elements/Button';
import CustomSelect from '../../../shared/ui/elements/CustomSelect';
import { Input } from '../../../shared/ui/elements/Input';
import AdminPageLayout from '../components/AdminPageLayout';
import ConfirmModal from '../../../shared/ui/complex/ConfirmModal';
import { AdminTable, AdminTh, AdminRow, AdminCell, LoadingRow, EmptyRow, FilterBar, GenericBadge, CsvExportButton } from '../components/AdminTableComponents';
import { useDataList } from '../../../shared/hooks/useDataList';
import { useConfirmDialog } from '../../../shared/hooks/useConfirmDialog';
import apiClient from '../../../shared/api/api';
import { exportToCsv } from '../../../shared/utils/exportToCsv';
import { ShieldAlert, X, ExternalLink, Check, AlertTriangle, RotateCcw, Inbox, User, FileWarning, Ban, CheckCircle, Copyright, HelpCircle, Search } from 'lucide-react';

const REASON_OPTIONS = [
    { value: 'all', label: 'Всі причини', icon: Inbox }, { value: 'spam', label: 'Спам', icon: Ban },
    { value: 'scam', label: 'Шахрайство', icon: ShieldAlert }, { value: 'inappropriate_content', label: 'Заборонений контент', icon: FileWarning },
    { value: 'copyright', label: 'Авторські права', icon: Copyright }, { value: 'other', label: 'Інше', icon: HelpCircle }
];

const STATUS_CONFIG = {
    new: { bg: 'color-mix(in srgb, var(--platform-danger), transparent 90%)', color: 'var(--platform-danger)', label: 'Нова', icon: AlertTriangle },
    dismissed: { bg: 'var(--platform-hover-bg)', color: 'var(--platform-text-secondary)', label: 'Відхилено', icon: X },
    banned: { bg: 'color-mix(in srgb, var(--platform-text-primary), transparent 90%)', color: 'var(--platform-text-primary)', label: 'Забанено', icon: Ban },
    resolved: { bg: 'color-mix(in srgb, var(--platform-success), transparent 90%)', color: 'var(--platform-success)', label: 'Вирішено', icon: CheckCircle }
};

const AdminReportsPage = () => {
    const [statusFilter, setStatusFilter] = useState('new');
    const [reasonFilter, setReasonFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const { filteredData: rawReports, loading, searchQuery, setSearchQuery, refresh } = useDataList(`/admin/reports?status=${statusFilter}`, ['site_title', 'reporter_email', 'reason', 'description', 'id']);
    const { isOpen, config, requestConfirm, close } = useConfirmDialog();
    const processedReports = useMemo(() => {
        let res = reasonFilter !== 'all' ? rawReports.filter(i => i.reason === reasonFilter) : [...rawReports];
        return res.sort((a, b) => (a[sortConfig.key] < b[sortConfig.key] ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1));
    }, [rawReports, reasonFilter, sortConfig]);
    const handleSort = (key) => setSortConfig(c => ({ key, direction: c.key === key && c.direction === 'desc' ? 'asc' : 'desc' }));
    const filterByUser = (email, e) => { e.stopPropagation(); setSearchQuery(email); toast.info(`Фільтр: ${email}`); };
    const handleAction = async (fn, msg) => { try { await fn(); toast.success(msg); close(); refresh(); } catch { toast.error('Помилка'); } };
    const actions = {
        dismiss: (id) => requestConfirm({ title: 'Відхилити?', message: 'В архів без санкцій.', type: 'warning', confirmLabel: 'Відхилити', onConfirm: () => handleAction(() => apiClient.put(`/admin/reports/${id}/dismiss`), 'Відхилено') }),
        ban: (id) => requestConfirm({ title: 'Заблокувати?', message: 'Сайт буде заблоковано.', type: 'danger', confirmLabel: 'Бан', onConfirm: () => handleAction(() => apiClient.post(`/admin/reports/${id}/ban`), 'Заблоковано') }),
        reopen: (id) => requestConfirm({ title: 'Відновити?', message: 'Повернути на розгляд.', type: 'info', confirmLabel: 'Відновити', onConfirm: () => handleAction(() => apiClient.put(`/admin/reports/${id}/reopen`), 'Відновлено') })
    };

    const handleExport = () => {
        if (!processedReports?.length) return toast.info('Немає даних');
        exportToCsv(processedReports.map(r => ({
            id: r.id, site: r.site_title || 'N/A', url: r.site_path, reason: REASON_OPTIONS.find(o => o.value === r.reason)?.label || r.reason,
            reporter: r.reporter_email || 'Анонім', status: STATUS_CONFIG[r.status]?.label || r.status, created: new Date(r.created_at).toLocaleString('uk-UA'), desc: r.description
        })), { id: 'ID', site: 'Сайт', url: 'URL', reason: 'Причина', reporter: 'Скаржник', status: 'Статус', created: 'Дата', desc: 'Опис' }, `reports_${new Date().toLocaleDateString('uk-UA')}`);
    };
    return (
        <AdminPageLayout title="Центр Скарг" icon={ShieldAlert} count={processedReports.length} onRefresh={refresh} loading={loading}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <FilterBar>
                    <div style={{ display: 'flex', background: 'var(--platform-card-bg)', padding: '2px', borderRadius: '8px', border: '1px solid var(--platform-border-color)' }}>
                        {[{ id: 'new', l: 'Нові' }, { id: 'dismissed', l: 'Відхилені' }, { id: 'banned', l: 'Забанені' }, { id: 'all', l: 'Всі' }].map(f => (
                            <Button key={f.id} variant="ghost" onClick={() => setStatusFilter(f.id)} style={{ padding: '4px 12px', height: '30px', fontSize: '13px', borderRadius: '6px', background: statusFilter === f.id ? 'var(--platform-bg)' : 'transparent', color: statusFilter === f.id ? 'var(--platform-text-primary)' : 'var(--platform-text-secondary)', boxShadow: statusFilter === f.id ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>{f.l}</Button>
                        ))}
                    </div>
                    <div style={{ width: '220px' }}><CustomSelect value={reasonFilter} onChange={(e) => setReasonFilter(e.target.value)} options={REASON_OPTIONS} variant="minimal" style={{ height: '36px', background: 'var(--platform-card-bg)' }} /></div>
                </FilterBar>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '300px' }}><Input placeholder="Пошук..." leftIcon={<Search size={16}/>} value={searchQuery || ''} onChange={(e) => setSearchQuery(e.target.value)} wrapperStyle={{margin: 0}} /></div>
                    <CsvExportButton onClick={handleExport} disabled={loading || !processedReports.length} />
                </div>
            </div>
            <AdminTable>
                <colgroup><col style={{width: '80px'}} /><col style={{width: '25%'}} /><col style={{width: 'auto'}} /><col style={{width: '20%'}} /><col style={{width: '15%'}} /><col style={{width: '150px'}} /><col style={{width: '120px'}} /></colgroup>
                <thead><tr><AdminTh label="ID" sortKey="id" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Сайт" sortKey="site_title" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Причина" sortKey="reason" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Скаржник" sortKey="reporter_email" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Дата" sortKey="created_at" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Статус" sortKey="status" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Дії" align="right" /></tr></thead>
                <tbody>
                    {loading ? <LoadingRow cols={7} /> : !processedReports.length ? <EmptyRow cols={7} /> : processedReports.map(r => {
                        const RIcon = (REASON_OPTIONS.find(o => o.value === r.reason) || REASON_OPTIONS[5]).icon;
                        const sStyle = STATUS_CONFIG[r.status] || STATUS_CONFIG.new;
                        return (
                            <AdminRow key={r.id} style={{ background: r.status === 'new' ? 'color-mix(in srgb, var(--platform-danger), transparent 98%)' : 'transparent' }}>
                                <AdminCell style={{opacity: 0.6}}>#{r.id}</AdminCell>
                                <AdminCell><div style={{ fontWeight: '600', fontSize: '15px' }}>{r.site_title || 'N/A'}</div>{r.site_path && <a href={`/site/${r.site_path}`} target="_blank" onClick={e=>e.stopPropagation()}><Button variant="outline" icon={<ExternalLink size={12} />} style={{ height: '24px', fontSize: '11px', padding: '0 8px' }}>Перевірити</Button></a>}</AdminCell>
                                <AdminCell><GenericBadge bg="color-mix(in srgb, var(--platform-warning), transparent 90%)" color="var(--platform-warning)" icon={RIcon} style={{marginBottom:'4px'}}>{REASON_OPTIONS.find(o=>o.value===r.reason)?.label}</GenericBadge>{r.description && <div style={{ fontSize: '12px', opacity: 0.7, overflow: 'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', maxWidth:'200px' }}>"{r.description}"</div>}</AdminCell>
                                <AdminCell><div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}><span title={r.reporter_email}>{r.reporter_email || 'Анонім'}</span>{r.reporter_email && <div onClick={(e)=>filterByUser(r.reporter_email, e)} style={{cursor:'pointer', opacity:0.5}}><User size={14}/></div>}</div></AdminCell>
                                <AdminCell><div style={{fontSize: '13px'}}>{new Date(r.created_at).toLocaleDateString()}</div><div style={{fontSize: '11px', opacity: 0.6}}>{new Date(r.created_at).toLocaleTimeString()}</div></AdminCell>
                                <AdminCell><GenericBadge color={sStyle.color} bg={sStyle.bg} icon={sStyle.icon}>{sStyle.label}</GenericBadge></AdminCell>
                                <AdminCell align="right"><div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                                    {r.status === 'new' ? <><Button variant="ghost" style={{ color: 'var(--platform-danger)', padding: '6px' }} title="Бан" onClick={() => actions.ban(r.id)} icon={<Check size={18} />} /><Button variant="ghost" style={{ color: 'var(--platform-text-secondary)', padding: '6px' }} title="Відхилити" onClick={() => actions.dismiss(r.id)} icon={<X size={18} />} /></> : <Button variant="ghost" style={{ color: 'var(--platform-accent)', padding: '6px' }} title="Відновити" onClick={() => actions.reopen(r.id)} icon={<RotateCcw size={18} />} />}
                                </div></AdminCell>
                            </AdminRow>
                        );
                    })}
                </tbody>
            </AdminTable>
            <ConfirmModal isOpen={isOpen} {...config} onCancel={close} />
        </AdminPageLayout>
    );
};
export default AdminReportsPage;