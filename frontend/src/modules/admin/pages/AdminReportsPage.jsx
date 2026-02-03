// frontend/src/modules/admin/pages/AdminReportsPage.jsx
import React, { useState, useMemo } from 'react';
import { Button } from '../../../shared/ui/elements/Button';
import { toast } from 'react-toastify';
import AdminPageLayout from '../components/AdminPageLayout';
import ConfirmModal from '../../../shared/ui/complex/ConfirmModal';
import { useDataList } from '../../../shared/hooks/useDataList';
import { useConfirmDialog } from '../../../shared/hooks/useConfirmDialog';
import apiClient from '../../../shared/api/api';
import { ShieldAlert, X, ExternalLink, Check, AlertTriangle, RotateCcw, Inbox } from 'lucide-react';

const AdminReportsPage = () => {
    const [filter, setFilter] = useState('new');
    const [viewMode, setViewMode] = useState('list');
    const { 
        filteredData: reports, loading, searchQuery, setSearchQuery, refresh 
    } = useDataList(`/admin/reports?status=${filter}`, ['site_title', 'reporter_email', 'reason', 'description']);
    const { isOpen, config, requestConfirm, close } = useConfirmDialog();
    const handleAction = async (actionFn, successMessage) => {
        try {
            await actionFn();
            toast.success(successMessage);
            close();
            refresh();
        } catch (err) {
            console.error(err);
            toast.error('Сталася помилка при виконанні дії');
        }
    };

    const actions = {
        dismiss: (id) => requestConfirm({
            title: 'Відхилити скаргу?',
            message: 'Скаргу буде переміщено в архів як необґрунтовану. Санкцій до сайту не буде застосовано.',
            type: 'warning',
            confirmLabel: 'Відхилити',
            onConfirm: () => handleAction(
                () => apiClient.put(`/admin/reports/${id}/dismiss`),
                'Скаргу відхилено'
            )
        }),
        ban: (id) => requestConfirm({
            title: 'Заблокувати сайт?',
            message: 'Ви підтверджуєте порушення? Сайт буде заблоковано, а власнику нараховано страйк.',
            type: 'danger',
            confirmLabel: 'Забанити сайт',
            onConfirm: () => handleAction(
                () => apiClient.post(`/admin/reports/${id}/ban`),
                'Сайт успішно заблоковано'
            )
        }),
        reopen: (id) => requestConfirm({
            title: 'Відновити розгляд?',
            message: 'Скарга повернеться в статус "Нова" для повторної перевірки.',
            type: 'info',
            confirmLabel: 'Відновити',
            onConfirm: () => handleAction(
                () => apiClient.put(`/admin/reports/${id}/reopen`),
                'Скаргу повернуто до розгляду'
            )
        })
    };

    const getReasonLabel = (reason) => {
        const reasons = {
            spam: 'Спам',
            scam: 'Шахрайство',
            inappropriate_content: 'Неприйнятний контент',
            copyright: 'Авторське право',
            other: 'Інше'
        };
        return reasons[reason] || reason;
    };

    const StatusBadge = ({ status }) => {
        const config = {
            new: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'Нова' },
            dismissed: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', label: 'Відхилено' },
            banned: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Забанено' },
            resolved: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Вирішено' }
        };
        const style = config[status] || config.new;
        
        return (
            <span style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                textTransform: 'uppercase', background: style.bg, color: style.color,
                border: `1px solid ${style.color}20`, display: 'inline-block', textAlign: 'center', minWidth: '80px'
            }}>
                {style.label}
            </span>
        );
    };

    const styles = useMemo(() => ({
        card: { background: 'var(--platform-card-bg)', borderRadius: '16px', border: '1px solid var(--platform-border-color)', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%' },
        wrapper: { flex: 1, overflowY: 'auto', width: '100%' },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '15px', tableLayout: 'fixed' },
        th: { textAlign: 'left', padding: '16px 20px', background: 'var(--platform-bg)', color: 'var(--platform-text-secondary)', fontWeight: '600', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--platform-border-color)', whiteSpace: 'nowrap' },
        td: { padding: '16px 20px', borderBottom: '1px solid var(--platform-border-color)', color: 'var(--platform-text-primary)', verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis' },
        row: { transition: 'background 0.2s' },
        reasonBadge: {
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 8px', borderRadius: '6px',
            background: 'rgba(245, 158, 11, 0.1)', color: '#d97706',
            fontWeight: '600', fontSize: '12px', border: '1px solid rgba(245, 158, 11, 0.2)'
        },
        filterGroup: { display: 'flex', gap: '4px', background: 'var(--platform-card-bg)', padding: '4px', borderRadius: '10px', border: '1px solid var(--platform-border-color)', height: 'fit-content' },
        emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--platform-text-secondary)', gap: '16px', padding: '40px' }
    }), []);

    return (
        <AdminPageLayout 
            title="Центр Скарг" icon={ShieldAlert} count={reports.length} 
            searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
            viewMode={viewMode} setViewMode={setViewMode} 
            onRefresh={refresh} loading={loading}
            searchPlaceholder="Пошук (сайт, email, причина)..."
        >
            <div style={{ marginBottom: '0px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--platform-text-secondary)' }}>Фільтр:</span>
                <div style={styles.filterGroup}>
                    {[
                        { id: 'new', label: 'Нові' },
                        { id: 'dismissed', label: 'Відхилені' },
                        { id: 'banned', label: 'Забанені' },
                        { id: 'all', label: 'Всі' }
                    ].map(f => (
                        <Button
                            key={f.id}
                            variant="ghost"
                            onClick={() => setFilter(f.id)}
                            style={{
                                padding: '6px 12px', height: '32px', fontSize: '13px',
                                background: filter === f.id ? 'var(--platform-bg)' : 'transparent',
                                color: filter === f.id ? 'var(--platform-text-primary)' : 'var(--platform-text-secondary)',
                                boxShadow: filter === f.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                border: filter === f.id ? '1px solid var(--platform-border-color)' : '1px solid transparent'
                            }}
                        >
                            {f.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div style={styles.card}>
                <div style={styles.wrapper} className="custom-scrollbar">
                    <table style={styles.table}>
                        <colgroup><col style={{width: '80px'}} /><col style={{width: '25%'}} /><col style={{width: 'auto'}} /><col style={{width: '20%'}} /><col style={{width: '15%'}} /><col style={{width: '140px'}} /><col style={{width: '120px'}} /></colgroup>
                        <thead>
                            <tr>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Сайт</th>
                                <th style={styles.th}>Причина / Опис</th>
                                <th style={styles.th}>Скаржник</th>
                                <th style={styles.th}>Дата</th>
                                <th style={styles.th}>Статус</th>
                                <th style={{...styles.th, textAlign: 'right'}}>Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => <tr key={i}><td colSpan="7" style={{padding:'24px', textAlign:'center', opacity:0.5}}>Завантаження...</td></tr>)
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        <div style={styles.emptyState}>
                                            <Inbox size={48} strokeWidth={1.5} opacity={0.5} />
                                            <span>У цьому розділі скарг немає</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reports.map(report => (
                                    <tr key={report.id} style={{ ...styles.row, background: report.status === 'new' ? 'rgba(59, 130, 246, 0.02)' : 'transparent', borderBottom: '1px solid var(--platform-border-color)' }} className="hover:bg-(--platform-bg)">
                                        <td style={{...styles.td, opacity: 0.6}}>#{report.id}</td>
                                        
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                                                {report.site_title || 'Невідомий сайт'}
                                            </div>
                                            {report.site_path && (
                                                <a 
                                                    href={`/site/${report.site_path}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{textDecoration: 'none'}}
                                                >
                                                    <Button 
                                                        variant="outline" 
                                                        icon={<ExternalLink size={12} />} 
                                                        style={{ height: '24px', fontSize: '11px', padding: '0 8px' }}
                                                    >
                                                        Перевірити
                                                    </Button>
                                                </a>
                                            )}
                                        </td>

                                        <td style={styles.td}>
                                            <div style={styles.reasonBadge}>
                                                <AlertTriangle size={12} />
                                                {getReasonLabel(report.reason)}
                                            </div>
                                            {report.description && (
                                                <div style={{ fontSize: '13px', color: 'var(--platform-text-secondary)', marginTop: '8px', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                    "{report.description}"
                                                </div>
                                            )}
                                        </td>

                                        <td style={styles.td}>
                                            <div title={report.reporter_email} style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500'}}>
                                                {report.reporter_email || <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Анонім</span>}
                                            </div>
                                        </td>

                                        <td style={styles.td}>
                                            <div style={{ fontSize: '13px' }}>
                                                {new Date(report.created_at).toLocaleDateString('uk-UA')}
                                            </div>
                                            <div style={{ fontSize: '11px', opacity: 0.6 }}>
                                                {new Date(report.created_at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>

                                        <td style={styles.td}>
                                            <StatusBadge status={report.status} />
                                        </td>

                                        <td style={{...styles.td, textAlign: 'right'}}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                {report.status === 'new' && (
                                                    <>
                                                        <Button 
                                                            variant="ghost" 
                                                            className="text-red-500 hover:bg-red-50"
                                                            style={{ color: '#ef4444', padding: '6px' }}
                                                            title="Забанити сайт" 
                                                            onClick={() => actions.ban(report.id)}
                                                            icon={<Check size={18} />} 
                                                        />
                                                        <Button 
                                                            variant="ghost" 
                                                            style={{ color: 'var(--platform-text-secondary)', padding: '6px' }}
                                                            title="Відхилити скаргу" 
                                                            onClick={() => actions.dismiss(report.id)}
                                                            icon={<X size={18} />}
                                                        />
                                                    </>
                                                )}
                                                {(report.status === 'dismissed' || report.status === 'banned') && (
                                                    <Button 
                                                        variant="ghost"
                                                        style={{ color: '#3b82f6', padding: '6px' }}
                                                        title="Відновити розгляд" 
                                                        onClick={() => actions.reopen(report.id)}
                                                        icon={<RotateCcw size={18} />}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal 
                isOpen={isOpen} 
                title={config.title} 
                message={config.message} 
                confirmLabel={config.confirmLabel} 
                cancelLabel={config.cancelLabel} 
                type={config.type} 
                onConfirm={config.onConfirm} 
                onCancel={close} 
            />
        </AdminPageLayout>
    );
};

export default AdminReportsPage;