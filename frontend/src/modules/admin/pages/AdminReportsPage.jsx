// frontend/src/modules/admin/pages/AdminReportsPage.jsx
import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../../../shared/ui/elements/Button';
import CustomSelect from '../../../shared/ui/elements/CustomSelect';
import { Input } from '../../../shared/ui/elements/Input';
import AdminPageLayout from '../components/AdminPageLayout';
import ConfirmModal from '../../../shared/ui/complex/ConfirmModal';
import { AdminTable, AdminTh, AdminRow, AdminCell, LoadingRow, EmptyRow, FilterBar, GenericBadge } from '../components/AdminTableComponents';
import { useDataList } from '../../../shared/hooks/useDataList';
import { useConfirmDialog } from '../../../shared/hooks/useConfirmDialog';
import apiClient from '../../../shared/api/api';
import { ShieldAlert, X, ExternalLink, Check, AlertTriangle, RotateCcw, Inbox, User, FileWarning, Ban, CheckCircle,Copyright, HelpCircle, Search } from 'lucide-react';


const REASON_OPTIONS = [
    { value: 'all', label: 'Всі причини', icon: Inbox },
    { value: 'spam', label: 'Спам або реклама', icon: Ban },
    { value: 'scam', label: 'Шахрайство', icon: ShieldAlert },
    { value: 'inappropriate_content', label: 'Заборонений контент', icon: FileWarning },
    { value: 'copyright', label: 'Порушення авторських прав', icon: Copyright },
    { value: 'other', label: 'Інше', icon: HelpCircle }
];

const getReasonLabel = (reason) => {
    const found = REASON_OPTIONS.find(opt => opt.value === reason);
    return found ? found.label : reason;
};

const StatusBadge = ({ status }) => {
    const config = {
        new: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'Нова', icon: AlertTriangle },
        dismissed: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', label: 'Відхилено', icon: X },
        banned: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Забанено', icon: Ban },
        resolved: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Вирішено', icon: CheckCircle }
    };
    const style = config[status] || config.new;
    return (
        <GenericBadge color={style.color} bg={style.bg} icon={style.icon}>
            {style.label}
        </GenericBadge>
    );
};

const AdminReportsPage = () => {
    const [statusFilter, setStatusFilter] = useState('new');
    const [reasonFilter, setReasonFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const { filteredData: rawReports, loading, searchQuery, setSearchQuery, refresh } = useDataList(`/admin/reports?status=${statusFilter}`, ['site_title', 'reporter_email', 'reason', 'description', 'id']);
    const { isOpen, config, requestConfirm, close } = useConfirmDialog();
    const processedReports = useMemo(() => {
        let result = [...rawReports];
        if (reasonFilter !== 'all') {
            result = result.filter(item => item.reason === reasonFilter);
        }
        result.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return result;
    }, [rawReports, reasonFilter, sortConfig]);
    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const filterByUser = (email, e) => {
        if (!email) return;
        e.stopPropagation();
        setSearchQuery(email);
        toast.info(`Фільтр по скаржнику: ${email}`);
    };

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
            onConfirm: () => handleAction(() => apiClient.put(`/admin/reports/${id}/dismiss`), 'Скаргу відхилено')
        }),
        ban: (id) => requestConfirm({
            title: 'Заблокувати сайт?',
            message: 'Ви підтверджуєте порушення? Сайт буде заблоковано, а власнику нараховано страйк.',
            type: 'danger',
            confirmLabel: 'Забанити сайт',
            onConfirm: () => handleAction(() => apiClient.post(`/admin/reports/${id}/ban`), 'Сайт успішно заблоковано')
        }),
        reopen: (id) => requestConfirm({
            title: 'Відновити розгляд?',
            message: 'Скарга повернеться в статус "Нова" для повторної перевірки.',
            type: 'info',
            confirmLabel: 'Відновити',
            onConfirm: () => handleAction(() => apiClient.put(`/admin/reports/${id}/reopen`), 'Скаргу повернуто до розгляду')
        })
    };

    return (
        <AdminPageLayout 
            title="Центр Скарг" icon={ShieldAlert} count={processedReports.length}
            onRefresh={refresh} loading={loading}
        >
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <FilterBar>
                    <div style={{ display: 'flex', background: 'var(--platform-card-bg)', padding: '2px', borderRadius: '8px', border: '1px solid var(--platform-border-color)' }}>
                        {[
                            { id: 'new', label: 'Нові' },
                            { id: 'dismissed', label: 'Відхилені' },
                            { id: 'banned', label: 'Забанені' },
                            { id: 'all', label: 'Всі' }
                        ].map(f => (
                            <Button
                                key={f.id}
                                variant="ghost"
                                onClick={() => setStatusFilter(f.id)}
                                style={{
                                    padding: '4px 12px', height: '30px', fontSize: '13px', borderRadius: '6px',
                                    background: statusFilter === f.id ? 'var(--platform-bg)' : 'transparent',
                                    color: statusFilter === f.id ? 'var(--platform-text-primary)' : 'var(--platform-text-secondary)',
                                    boxShadow: statusFilter === f.id ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                {f.label}
                            </Button>
                        ))}
                    </div>

                    <div style={{ width: '220px' }}>
                        <CustomSelect 
                            value={reasonFilter} onChange={(e) => setReasonFilter(e.target.value)}
                            options={REASON_OPTIONS} variant="minimal" style={{ height: '36px', background: 'var(--platform-card-bg)' }}
                        />
                    </div>
                </FilterBar>

                <div style={{ width: '300px' }}>
                    <Input 
                        placeholder="Пошук (сайт, email, причина)..."
                        leftIcon={<Search size={16}/>}
                        value={searchQuery || ''} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                        wrapperStyle={{margin: 0}}
                    />
                </div>
            </div>

            <AdminTable>
                <colgroup><col style={{width: '80px'}} /><col style={{width: '25%'}} /><col style={{width: 'auto'}} /><col style={{width: '20%'}} /><col style={{width: '15%'}} /><col style={{width: '150px'}} /><col style={{width: '120px'}} /></colgroup>
                <thead>
                    <tr>
                        <AdminTh label="ID" sortKey="id" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Сайт" sortKey="site_title" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Причина / Опис" sortKey="reason" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Скаржник" sortKey="reporter_email" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Дата" sortKey="created_at" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Статус" sortKey="status" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Дії" align="right" />
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <LoadingRow cols={7} />
                    ) : processedReports.length === 0 ? (
                        <EmptyRow cols={7} message="У цьому розділі скарг немає" />
                    ) : (
                        processedReports.map(report => {
                            const reasonConfig = REASON_OPTIONS.find(r => r.value === report.reason) || REASON_OPTIONS[5];
                            const ReasonIcon = reasonConfig.icon;

                            return (
                                <AdminRow 
                                    key={report.id} 
                                    style={{ background: report.status === 'new' ? 'rgba(59, 130, 246, 0.02)' : 'transparent' }}
                                >
                                    <AdminCell style={{opacity: 0.6}}>#{report.id}</AdminCell>
                                    <AdminCell>
                                        <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                                            {report.site_title || 'Невідомий сайт'}
                                        </div>
                                        {report.site_path && (
                                            <a 
                                                href={`/site/${report.site_path}`} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Button variant="outline" icon={<ExternalLink size={12} />} style={{ height: '24px', fontSize: '11px', padding: '0 8px' }}>
                                                    Перевірити
                                                </Button>
                                            </a>
                                        )}
                                    </AdminCell>

                                    <AdminCell>
                                        <GenericBadge 
                                            bg="rgba(245, 158, 11, 0.1)" 
                                            color="#d97706" 
                                            icon={ReasonIcon}
                                            style={{ marginBottom: '8px' }}
                                        >
                                            {getReasonLabel(report.reason)}
                                        </GenericBadge>
                                        
                                        {report.description && (
                                            <div style={{ fontSize: '13px', color: 'var(--platform-text-secondary)', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                "{report.description}"
                                            </div>
                                        )}
                                    </AdminCell>

                                    <AdminCell>
                                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px'}}>
                                            <div title={report.reporter_email} style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500'}}>
                                                {report.reporter_email || <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Анонім</span>}
                                            </div>
                                            {report.reporter_email && (
                                                <div 
                                                    title="Фільтрувати по цьому скаржнику"
                                                    onClick={(e) => filterByUser(report.reporter_email, e)}
                                                    style={{
                                                        padding: '4px', borderRadius: '4px', cursor: 'pointer', 
                                                        color: 'var(--platform-text-secondary)', flexShrink: 0
                                                    }}
                                                    className="hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-(--platform-accent)"
                                                >
                                                    <User size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </AdminCell>

                                    <AdminCell>
                                        <div style={{ fontSize: '13px' }}>
                                            {new Date(report.created_at).toLocaleDateString('uk-UA')}
                                        </div>
                                        <div style={{ fontSize: '11px', opacity: 0.6 }}>
                                            {new Date(report.created_at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </AdminCell>

                                    <AdminCell>
                                        <StatusBadge status={report.status} />
                                    </AdminCell>

                                    <AdminCell align="right">
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
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
                                    </AdminCell>
                                </AdminRow>
                            );
                        })
                    )}
                </tbody>
            </AdminTable>

            <ConfirmModal isOpen={isOpen} {...config} onCancel={close} />
        </AdminPageLayout>
    );
};

export default AdminReportsPage;