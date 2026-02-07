// frontend/src/modules/admin/pages/AdminTicketsPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../../shared/ui/elements/Button';
import Avatar from '../../../shared/ui/elements/Avatar';
import CustomSelect from '../../../shared/ui/elements/CustomSelect';
import { Input } from '../../../shared/ui/elements/Input';
import AdminPageLayout from '../components/AdminPageLayout';
import ConfirmModal from '../../../shared/ui/complex/ConfirmModal';
import { AdminTable, AdminTh, AdminRow, AdminCell, LoadingRow, EmptyRow, FilterBar, GenericBadge, CsvExportButton } from '../components/AdminTableComponents';
import { useDataList } from '../../../shared/hooks/useDataList';
import { useConfirmDialog } from '../../../shared/hooks/useConfirmDialog';
import apiClient from '../../../shared/api/api';
import { exportToCsv } from '../../../shared/utils/exportToCsv';
import { MessageSquare, CheckCircle, Gavel, XCircle, RotateCcw, Clock, ExternalLink, Inbox, User, HelpCircle, Wrench, CreditCard, Handshake, Search } from 'lucide-react';

const CATEGORY_OPTIONS = [
    { value: 'all', label: 'Всі', icon: Inbox }, { value: 'general', label: 'Загальні', icon: HelpCircle },
    { value: 'technical', label: 'Технічні', icon: Wrench }, { value: 'billing', label: 'Оплата', icon: CreditCard },
    { value: 'complaint', label: 'Скарга', icon: MessageSquare }, { value: 'partnership', label: 'Співпраця', icon: Handshake }, { value: 'appeal', label: 'Апеляція', icon: Gavel }
];
const COLORS = { general: '#3b82f6', technical: '#8b5cf6', billing: '#10b981', complaint: '#ef4444', partnership: '#ec4899', appeal: '#f97316' };

const AdminTicketsPage = () => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('active');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'updated_at', direction: 'desc' });
    const { filteredData: rawTickets, loading, searchQuery, setSearchQuery, refresh } = useDataList(`/support/admin/tickets?status=${statusFilter}`, ['subject', 'username', 'user_email', 'id']);
    const { isOpen, config, requestConfirm, close } = useConfirmDialog();

    const processedTickets = useMemo(() => {
        let res = categoryFilter !== 'all' ? rawTickets.filter(t => t.type === categoryFilter) : [...rawTickets];
        return res.sort((a, b) => (a[sortConfig.key] < b[sortConfig.key] ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1));
    }, [rawTickets, categoryFilter, sortConfig]);

    const handleSort = (key) => setSortConfig(c => ({ key, direction: c.key === key && c.direction === 'desc' ? 'asc' : 'desc' }));
    const handleAction = async (fn, msg) => { try { await fn(); toast.success(msg); close(); refresh(); } catch { toast.error('Помилка'); } };

    const actions = {
        closeTicket: (id) => requestConfirm({ title: 'Закрити?', message: `Тікет #${id} в архів.`, type: 'warning', confirmLabel: 'Закрити', onConfirm: () => handleAction(() => apiClient.put(`/support/admin/${id}/status`, { status: 'closed' }), 'Закрито') }),
        restoreTicket: (id) => requestConfirm({ title: 'Відновити?', message: `Тікет #${id} активний.`, type: 'info', confirmLabel: 'Відновити', onConfirm: () => handleAction(() => apiClient.put(`/support/admin/${id}/status`, { status: 'open' }), 'Відновлено') })
    };

    const handleExport = () => {
        if (!processedTickets?.length) return toast.info('Немає даних');
        exportToCsv(processedTickets.map(t => ({
            id: t.id, subject: t.subject, category: CATEGORY_OPTIONS.find(o => o.value === t.type)?.label || t.type,
            user: t.username, email: t.user_email, status: t.status === 'open' ? 'Відкрито' : t.status === 'answered' ? 'Відповідь' : 'Закрито',
            updated: new Date(t.updated_at).toLocaleString('uk-UA')
        })), { id: 'ID', subject: 'Тема', category: 'Категорія', user: 'Користувач', email: 'Email', status: 'Статус', updated: 'Оновлено' }, `tickets_${new Date().toLocaleDateString('uk-UA')}`);
    };

    return (
        <AdminPageLayout title="Підтримка" icon={MessageSquare} count={processedTickets.length} onRefresh={refresh} loading={loading}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <FilterBar>
                    <div style={{ display: 'flex', background: 'var(--platform-card-bg)', padding: '2px', borderRadius: '8px', border: '1px solid var(--platform-border-color)' }}>
                        {['active', 'closed'].map(s => <Button key={s} variant="ghost" onClick={() => setStatusFilter(s)} style={{ padding: '4px 12px', height: '30px', fontSize: '13px', borderRadius: '6px', background: statusFilter === s ? 'var(--platform-bg)' : 'transparent', color: statusFilter === s ? 'var(--platform-text-primary)' : 'var(--platform-text-secondary)' }}>{s === 'active' ? 'Активні' : 'Архів'}</Button>)}
                    </div>
                    <div style={{ width: '220px' }}><CustomSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} options={CATEGORY_OPTIONS} variant="minimal" style={{ height: '36px', background: 'var(--platform-card-bg)' }} /></div>
                </FilterBar>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '300px' }}><Input placeholder="Пошук..." leftIcon={<Search size={16}/>} value={searchQuery || ''} onChange={(e) => setSearchQuery(e.target.value)} wrapperStyle={{margin: 0}} /></div>
                    <CsvExportButton onClick={handleExport} disabled={loading || !processedTickets.length} />
                </div>
            </div>
            <AdminTable>
                <colgroup><col style={{width: '80px'}} /><col style={{width: '30%'}} /><col style={{width: '140px'}} /><col style={{width: '25%'}} /><col style={{width: '140px'}} /><col style={{width: '160px'}} /><col style={{width: '100px'}} /></colgroup>
                <thead><tr><AdminTh label="ID" sortKey="id" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Тема" sortKey="subject" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Категорія" sortKey="type" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Користувач" sortKey="username" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Статус" sortKey="status" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Оновлено" sortKey="updated_at" currentSort={sortConfig} onSort={handleSort} align="right" /><AdminTh label="Дії" align="right" /></tr></thead>
                <tbody>
                    {loading ? <LoadingRow cols={7} /> : !processedTickets.length ? <EmptyRow cols={7} /> : processedTickets.map(t => {
                        const catOpt = CATEGORY_OPTIONS.find(o => o.value === t.type) || CATEGORY_OPTIONS[1];
                        const sProps = t.status === 'open' ? {bg:'rgba(245,158,11,0.1)',c:'#d97706',i:Clock,l:'Відкрито'} : t.status==='answered'?{bg:'rgba(16,185,129,0.1)',c:'#10b981',i:MessageSquare,l:'Відповідь'}:{bg:'rgba(148,163,184,0.1)',c:'#64748b',i:CheckCircle,l:'Закрито'};
                        return (
                            <AdminRow key={t.id} onClick={(e) => {e.stopPropagation();navigate(`/support/ticket/${t.id}`)}} style={{ background: t.status!=='closed' ? 'rgba(59, 130, 246, 0.02)' : 'transparent' }}>
                                <AdminCell style={{opacity: 0.6, fontSize: '13px'}}>#{t.id}</AdminCell>
                                <AdminCell><div style={{fontWeight: '600', fontSize: '15px'}}>{t.subject}</div><div style={{fontSize: '13px', opacity: 0.7, maxWidth: '350px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{t.body}</div></AdminCell>
                                <AdminCell><GenericBadge color={COLORS[t.type] || '#3b82f6'} bg={`${COLORS[t.type] || '#3b82f6'}1a`} icon={catOpt.icon}>{catOpt.label}</GenericBadge></AdminCell>
                                <AdminCell><div style={{display:'flex', alignItems:'center', gap:'10px'}}><Avatar url={t.user_avatar_url} name={t.username} size={32} /><div><div style={{fontWeight: '500'}}>{t.username}</div><div style={{fontSize: '12px', opacity: 0.6}}>{t.user_email}</div></div></div></AdminCell>
                                <AdminCell><GenericBadge color={sProps.c} bg={sProps.bg} icon={sProps.i}>{sProps.l}</GenericBadge></AdminCell>
                                <AdminCell align="right" style={{fontFamily: 'monospace', opacity: 0.7}}>{new Date(t.updated_at).toLocaleString('uk-UA')}</AdminCell>
                                <AdminCell align="right"><div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}><Button variant="ghost" style={{ color: '#3b82f6', padding: '6px' }} icon={<ExternalLink size={18} />} onClick={(e) => {e.stopPropagation();navigate(`/support/ticket/${t.id}`)}} /><Button variant="ghost" title={t.status==='closed'?"Відновити":"Закрити"} onClick={() => t.status==='closed' ? actions.restoreTicket(t.id) : actions.closeTicket(t.id)} style={{ color: t.status==='closed'?'#10b981':'#ef4444', padding: '6px' }} icon={t.status==='closed' ? <RotateCcw size={18} /> : <XCircle size={18} />} /></div></AdminCell>
                            </AdminRow>
                        );
                    })}
                </tbody>
            </AdminTable>
            <ConfirmModal isOpen={isOpen} {...config} onCancel={close} />
        </AdminPageLayout>
    );
};
export default AdminTicketsPage;