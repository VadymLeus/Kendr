// frontend/src/modules/admin/pages/AdminLogsPage.jsx
import React, { useMemo, useState } from 'react';
import { useDataList } from '../../../shared/hooks/useDataList';
import Avatar from '../../../shared/ui/elements/Avatar';
import CustomSelect from '../../../shared/ui/elements/CustomSelect';
import { Input } from '../../../shared/ui/elements/Input';
import { AdminTable, AdminTh, AdminRow, AdminCell, LoadingRow, EmptyRow, FilterBar, GenericBadge } from '../components/AdminTableComponents';
import { UserX, ShieldAlert, Globe, Layout, Trash2, CheckCircle, Ban, AlertTriangle, FileText, Clock, Inbox, Search } from 'lucide-react';

const ACTION_CONFIG = {
    'user_delete': { label: 'Видалення користувача', icon: UserX, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    'site_suspend': { label: 'Бан сайту', icon: Ban, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    'site_restore': { label: 'Відновлення сайту', icon: CheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    'site_delete': { label: 'Видалення сайту', icon: Trash2, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    'site_probation': { label: 'Випробувальний термін', icon: Clock, color: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
    'report_dismiss': { label: 'Відхилення скарги', icon: ShieldAlert, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' },
    'report_reopen': { label: 'Повернення скарги', icon: ShieldAlert, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    'report_ban': { label: 'Бан по скарзі', icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    'template_create': { label: 'Створено шаблон', icon: Layout, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    'template_update': { label: 'Оновлено шаблон', icon: Layout, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    'template_delete': { label: 'Видалено шаблон', icon: Trash2, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    'ticket_close': { label: 'Закрито тікет', icon: FileText, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' },
    'default': { label: 'Дія', icon: Layout, color: 'var(--platform-text-primary)', bg: 'var(--platform-bg)' }
};

const ACTION_OPTIONS = [
    { value: 'all', label: 'Всі дії', icon: Inbox },
    ...Object.entries(ACTION_CONFIG).filter(([key]) => key !== 'default').map(([key, val]) => ({ value: key, label: val.label, icon: val.icon }))
];

const ActionBadge = ({ type }) => {
    const style = ACTION_CONFIG[type] || ACTION_CONFIG['default'];
    return <GenericBadge bg={style.bg} color={style.color} icon={style.icon}>{style.label}</GenericBadge>;
};

const DetailItem = ({ label, value }) => {
    if (!value) return null;
    return (
        <div style={{ display: 'flex', gap: '4px', fontSize: '12px', color: 'var(--platform-text-secondary)' }}>
            <span>{label}:</span><span style={{ fontWeight: '500', color: 'var(--platform-text-primary)' }}>{value}</span>
        </div>
    );
};

const AdminLogsPage = () => {
    const [actionFilter, setActionFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const { filteredData: rawLogs, loading, searchQuery, setSearchQuery } = useDataList('/admin/logs', ['admin_name', 'action_type', 'target_type']);
    const processedLogs = useMemo(() => {
        let result = [...rawLogs];
        if (actionFilter !== 'all') result = result.filter(log => log.action_type === actionFilter);
        result.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return result;
    }, [rawLogs, actionFilter, sortConfig]);
    const handleSort = (key) => setSortConfig(c => ({ key, direction: c.key === key && c.direction === 'desc' ? 'asc' : 'desc' }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                <FilterBar>
                    <div style={{ width: '250px' }}>
                        <CustomSelect 
                            value={actionFilter} 
                            onChange={(e) => setActionFilter(e.target.value)} 
                            options={ACTION_OPTIONS} 
                            variant="minimal" 
                            style={{ height: '36px', background: 'var(--platform-card-bg)' }} 
                            placeholder="Фільтр за дією" 
                        />
                    </div>
                </FilterBar>

                <div style={{ width: '300px' }}>
                    <Input 
                        placeholder="Пошук (адмін, дія, ID)..."
                        leftIcon={<Search size={16}/>}
                        value={searchQuery || ''} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                        wrapperStyle={{margin: 0}}
                    />
                </div>
            </div>

            <AdminTable>
                <colgroup><col style={{width: '20%'}} /><col style={{width: '20%'}} /><col style={{width: '15%'}} /><col style={{width: '30%'}} /><col style={{width: '15%'}} /></colgroup>
                <thead>
                    <tr>
                        <AdminTh label="Адміністратор" sortKey="admin_name" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Дія" sortKey="action_type" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Ціль (Target)" sortKey="target_type" currentSort={sortConfig} onSort={handleSort} />
                        <AdminTh label="Деталі" />
                        <AdminTh label="Дата" sortKey="created_at" currentSort={sortConfig} onSort={handleSort} align="right" />
                    </tr>
                </thead>
                <tbody>
                    {loading ? <LoadingRow cols={5} /> : processedLogs.length === 0 ? <EmptyRow cols={5} message="Записів немає" /> : (
                        processedLogs.map(log => {
                            const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                            return (
                                <AdminRow key={log.id}>
                                    <AdminCell>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                            <Avatar url={log.admin_avatar} name={log.admin_name} size={32} />
                                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                                <span style={{fontWeight: '600'}}>{log.admin_name}</span>
                                                <span style={{fontSize: '11px', opacity: 0.6}}>{log.ip_address}</span>
                                            </div>
                                        </div>
                                    </AdminCell>
                                    <AdminCell><ActionBadge type={log.action_type} /></AdminCell>
                                    <AdminCell>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--platform-text-secondary)'}}>
                                                {log.target_type === 'site' && <Globe size={12}/>}
                                                {log.target_type === 'user' && <UserX size={12}/>}
                                                {log.target_type === 'report' && <ShieldAlert size={12}/>}
                                                {log.target_type === 'template' && <Layout size={12}/>}
                                                {log.target_type}
                                            </div>
                                            {log.target_id && <span style={{fontFamily: 'monospace', fontSize: '11px', background: 'var(--platform-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--platform-border-color)'}}>ID: {log.target_id}</span>}
                                        </div>
                                    </AdminCell>
                                    <AdminCell>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
                                            {details ? Object.entries(details).map(([k, v]) => <DetailItem key={k} label={k} value={v} />) : <span style={{opacity: 0.4, fontSize: '12px'}}>—</span>}
                                        </div>
                                    </AdminCell>
                                    <AdminCell align="right" style={{fontSize: '13px', color: 'var(--platform-text-secondary)'}}>
                                        <div>{new Date(log.created_at).toLocaleDateString()}</div>
                                        <div style={{fontSize: '11px', opacity: 0.6}}>{new Date(log.created_at).toLocaleTimeString()}</div>
                                    </AdminCell>
                                </AdminRow>
                            );
                        })
                    )}
                </tbody>
            </AdminTable>
        </div>
    );
};

export default AdminLogsPage;