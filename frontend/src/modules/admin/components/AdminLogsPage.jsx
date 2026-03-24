// frontend/src/modules/admin/components/AdminLogsPage.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDataList } from '../../../shared/hooks/useDataList';
import Avatar from '../../../shared/ui/elements/Avatar';
import CustomSelect from '../../../shared/ui/elements/CustomSelect';
import { Input } from '../../../shared/ui/elements/Input';
import DateRangePicker from '../../../shared/ui/elements/DateRangePicker';
import { AdminTable, AdminTh, AdminRow, AdminCell, LoadingRow, EmptyRow, FilterBar, GenericBadge, CsvExportButton } from './AdminTableComponents';
import { exportToCsv } from '../../../shared/utils/exportToCsv';
import { UserX, ShieldAlert, Globe, Layout, Trash2, CheckCircle, Ban, AlertTriangle, FileText, Clock, Inbox, Search, Users, Shield } from 'lucide-react';

const ACTION_CONFIG = {
    'user_delete': { label: 'Видалення користувача', icon: UserX, color: 'var(--platform-danger)', bg: 'color-mix(in srgb, var(--platform-danger), transparent 90%)' },
    'site_suspend': { label: 'Блокування сайту', icon: Ban, color: 'var(--platform-danger)', bg: 'color-mix(in srgb, var(--platform-danger), transparent 90%)' },
    'site_restore': { label: 'Відновлення сайту', icon: CheckCircle, color: 'var(--platform-success)', bg: 'color-mix(in srgb, var(--platform-success), transparent 90%)' },
    'site_delete': { label: 'Видалення сайту', icon: Trash2, color: 'var(--platform-danger)', bg: 'color-mix(in srgb, var(--platform-danger), transparent 90%)' },
    'site_probation': { label: 'Випробувальний термін', icon: Clock, color: 'var(--platform-warning)', bg: 'color-mix(in srgb, var(--platform-warning), transparent 90%)' },
    'report_dismiss': { label: 'Відхилення скарги', icon: ShieldAlert, color: 'var(--platform-text-secondary)', bg: 'var(--platform-hover-bg)' },
    'report_reopen': { label: 'Повернення скарги', icon: ShieldAlert, color: 'var(--platform-accent)', bg: 'color-mix(in srgb, var(--platform-accent), transparent 90%)' },
    'report_ban': { label: 'Блокування по скарзі', icon: AlertTriangle, color: 'var(--platform-danger)', bg: 'color-mix(in srgb, var(--platform-danger), transparent 90%)' },
    'template_create': { label: 'Створено шаблон', icon: Layout, color: 'var(--platform-accent)', bg: 'color-mix(in srgb, var(--platform-accent), transparent 90%)' },
    'template_update': { label: 'Оновлено шаблон', icon: Layout, color: 'var(--platform-accent)', bg: 'color-mix(in srgb, var(--platform-accent), transparent 90%)' },
    'template_delete': { label: 'Видалено шаблон', icon: Trash2, color: 'var(--platform-danger)', bg: 'color-mix(in srgb, var(--platform-danger), transparent 90%)' },
    'ticket_close': { label: 'Закрито тікет', icon: FileText, color: 'var(--platform-text-secondary)', bg: 'var(--platform-hover-bg)' },
    'default': { label: 'Дія', icon: Layout, color: 'var(--platform-text-primary)', bg: 'var(--platform-bg)' }
};

const ACTION_OPTIONS = [{ value: 'all', label: 'Всі дії', icon: Inbox }, ...Object.entries(ACTION_CONFIG).filter(([k]) => k !== 'default').map(([k, v]) => ({ value: k, label: v.label, icon: v.icon }))];
const ROLE_OPTIONS = [
    { value: 'all', label: 'Всі ролі', icon: Users },
    { value: 'admin', label: 'Адміністратори', icon: ShieldAlert },
    { value: 'moderator', label: 'Модератори', icon: Shield }
];

const ActionBadge = ({ type }) => { const s = ACTION_CONFIG[type] || ACTION_CONFIG['default']; return <GenericBadge bg={s.bg} color={s.color} icon={s.icon}>{s.label}</GenericBadge>; };
const DetailItem = ({ label, value }) => value ? <div style={{ display: 'flex', gap: '4px', fontSize: '12px', color: 'var(--platform-text-secondary)' }}><span>{label}:</span><span style={{ fontWeight: '500', color: 'var(--platform-text-primary)' }}>{value}</span></div> : null;
const AdminLogsPage = () => {
    const [actionFilter, setActionFilter] = useState(() => sessionStorage.getItem('admin_logs_action_filter') || 'all');
    const [roleFilter, setRoleFilter] = useState(() => sessionStorage.getItem('admin_logs_role_filter') || 'all');
    const [startDate, setStartDate] = useState(() => sessionStorage.getItem('admin_logs_start_date') || '');
    const [endDate, setEndDate] = useState(() => sessionStorage.getItem('admin_logs_end_date') || '');
    const [sortConfig, setSortConfig] = useState(() => {
        const savedSort = sessionStorage.getItem('admin_logs_sort_config');
        return savedSort ? JSON.parse(savedSort) : { key: 'created_at', direction: 'desc' };
    });
    const { filteredData: rawLogs, loading, searchQuery, setSearchQuery } = useDataList('/admin/logs', ['admin_name', 'action_type', 'target_type', 'admin_role']);
    useEffect(() => sessionStorage.setItem('admin_logs_action_filter', actionFilter), [actionFilter]);
    useEffect(() => sessionStorage.setItem('admin_logs_role_filter', roleFilter), [roleFilter]);
    useEffect(() => sessionStorage.setItem('admin_logs_start_date', startDate), [startDate]);
    useEffect(() => sessionStorage.setItem('admin_logs_end_date', endDate), [endDate]);
    useEffect(() => sessionStorage.setItem('admin_logs_sort_config', JSON.stringify(sortConfig)), [sortConfig]);
    useEffect(() => {
        const savedSearch = sessionStorage.getItem('admin_logs_search_query');
        if (savedSearch && savedSearch !== searchQuery) {
            setSearchQuery(savedSearch);
        }
    }, []);
    useEffect(() => {
        if (searchQuery !== undefined) {
            sessionStorage.setItem('admin_logs_search_query', searchQuery);
        }
    }, [searchQuery]);
    
    const processedLogs = useMemo(() => {
        let res = [...rawLogs];
        if (actionFilter !== 'all') {
            res = res.filter(l => l.action_type === actionFilter);
        }

        if (roleFilter !== 'all') {
            res = res.filter(l => l.admin_role === roleFilter);
        }

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            res = res.filter(l => new Date(l.created_at).getTime() >= start.getTime());
        }
        
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            res = res.filter(l => new Date(l.created_at).getTime() <= end.getTime());
        }
        return res.sort((a, b) => (a[sortConfig.key] < b[sortConfig.key] ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1));
    }, [rawLogs, actionFilter, roleFilter, startDate, endDate, sortConfig]);
    
    const handleSort = (key) => setSortConfig(c => ({ key, direction: c.key === key && c.direction === 'desc' ? 'asc' : 'desc' }));
    const handleExport = () => {
        if (!processedLogs?.length) return toast.info('Немає даних');
        exportToCsv(processedLogs.map(log => ({
            id: log.id, admin: log.admin_name, role: log.admin_role, ip: log.ip_address, action: ACTION_CONFIG[log.action_type]?.label || log.action_type,
            target_type: log.target_type, target_id: log.target_id, details: typeof log.details === 'string' ? log.details : JSON.stringify(log.details),
            created_at: new Date(log.created_at).toLocaleString('uk-UA')
        })), { id: 'ID', admin: 'Адміністратор', role: 'Роль', ip: 'IP', action: 'Дія', target_type: 'Тип цілі', target_id: 'ID цілі', details: 'Деталі', created_at: 'Дата' }, `logs_${new Date().toLocaleDateString('uk-UA')}`);
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                <FilterBar style={{ flexWrap: 'wrap' }}>
                    <div style={{ width: '220px' }}>
                        <CustomSelect value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} options={ACTION_OPTIONS} variant="minimal" style={{ height: '42px', background: 'var(--platform-card-bg)' }} placeholder="Всі дії" />
                    </div>
                    <div style={{ width: '180px' }}>
                        <CustomSelect value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} options={ROLE_OPTIONS} variant="minimal" style={{ height: '42px', background: 'var(--platform-card-bg)' }} placeholder="Всі ролі" />
                    </div>
                    <DateRangePicker 
                        startDate={startDate} 
                        endDate={endDate} 
                        onStartDateChange={setStartDate} 
                        onEndDateChange={setEndDate} 
                        onClear={() => { setStartDate(''); setEndDate(''); }} 
                    />
                </FilterBar>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '280px' }}>
                        <Input placeholder="Пошук (ініціатор, дія, ID)..." leftIcon={<Search size={16}/>} value={searchQuery || ''} onChange={(e) => setSearchQuery(e.target.value)} wrapperStyle={{margin: 0}} />
                    </div>
                    <CsvExportButton onClick={handleExport} disabled={loading || !processedLogs.length} />
                </div>
            </div>

            <AdminTable>
                <colgroup><col style={{width: '20%'}} /><col style={{width: '20%'}} /><col style={{width: '15%'}} /><col style={{width: '30%'}} /><col style={{width: '15%'}} /></colgroup>
                <thead><tr><AdminTh label="Ініціатор" sortKey="admin_name" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Дія" sortKey="action_type" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Ціль" sortKey="target_type" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Деталі" /><AdminTh label="Дата" sortKey="created_at" currentSort={sortConfig} onSort={handleSort} align="right" /></tr></thead>
                <tbody>
                    {loading ? <LoadingRow cols={5} /> : !processedLogs.length ? <EmptyRow cols={5} message="Записів немає" /> : processedLogs.map(log => (
                        <AdminRow key={log.id}>
                            <AdminCell>
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                    <Avatar url={log.admin_avatar} name={log.admin_name} size={32} />
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <span style={{fontWeight: '600'}}>
                                            {log.admin_name}
                                            {log.admin_role === 'admin' && <span style={{marginLeft:'4px', color:'var(--platform-danger)'}} title="Адміністратор">★</span>}
                                            {log.admin_role === 'moderator' && <span style={{marginLeft:'4px', color:'var(--platform-warning)'}} title="Модератор">✦</span>}
                                        </span>
                                        <span style={{fontSize: '11px', opacity: 0.6}}>{log.ip_address}</span>
                                    </div>
                                </div>
                            </AdminCell>
                            <AdminCell><ActionBadge type={log.action_type} /></AdminCell>
                            <AdminCell><div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}><div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--platform-text-secondary)'}}>{log.target_type === 'site' && <Globe size={12}/>}{log.target_type === 'user' && <UserX size={12}/>}{log.target_type === 'report' && <ShieldAlert size={12}/>}{log.target_type === 'template' && <Layout size={12}/>}{log.target_type}</div>{log.target_id && <span style={{fontFamily: 'monospace', fontSize: '11px', background: 'var(--platform-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--platform-border-color)'}}>ID: {log.target_id}</span>}</div></AdminCell>
                            <AdminCell><div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>{log.details ? Object.entries(typeof log.details === 'string' ? JSON.parse(log.details) : log.details).map(([k, v]) => <DetailItem key={k} label={k} value={v} />) : <span style={{opacity: 0.4}}>—</span>}</div></AdminCell>
                            <AdminCell align="right" style={{fontSize: '13px', color: 'var(--platform-text-secondary)'}}><div>{new Date(log.created_at).toLocaleDateString()}</div><div style={{fontSize: '11px', opacity: 0.6}}>{new Date(log.created_at).toLocaleTimeString()}</div></AdminCell>
                        </AdminRow>
                    ))}
                </tbody>
            </AdminTable>
        </div>
    );
};
export default AdminLogsPage;