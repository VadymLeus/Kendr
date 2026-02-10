// frontend/src/modules/admin/pages/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../../shared/api/api';
import CustomSelect from '../../../shared/ui/elements/CustomSelect'; 
import AdminPageLayout from '../components/AdminPageLayout';
import AdminLogsPage from '../components/AdminLogsPage'; 
import { Users, Globe, AlertTriangle, MessageSquare, LayoutDashboard, TrendingUp, BarChart2, ArrowUpRight, ArrowDownRight, Calendar, Activity, Zap, Check, Ban, Lock, EyeOff, Shield, Archive, CheckCircle } from 'lucide-react';

const GRAPH_TYPE_OPTIONS = [
    { label: 'Користувачі', value: 'users', icon: Users },
    { label: 'Сайти', value: 'sites', icon: Globe },
    { label: 'Тікети', value: 'tickets', icon: MessageSquare }
];

const PERIOD_OPTIONS = [
    { label: 'Останні 7 днів', value: 7, icon: Calendar },
    { label: 'Останні 30 днів', value: 30, icon: Calendar }
];

const LOG_TYPE_OPTIONS = [
    { label: 'Всі події', value: 'all', icon: Activity },
    { label: 'Реєстрації', value: 'user', icon: Users },
    { label: 'Сайти', value: 'site', icon: Globe },
    { label: 'Скарги', value: 'report', icon: AlertTriangle },
    { label: 'Тікети', value: 'ticket', icon: MessageSquare }
];

const SORT_OPTIONS = [
    { label: 'Спочатку нові', value: 'newest', icon: ArrowUpRight },
    { label: 'Спочатку старі', value: 'oldest', icon: ArrowDownRight }
];

const ENTITY_STYLES = {
    users:   { var: '--platform-accent', icon: Users },
    sites:   { var: '--platform-success', icon: Globe },
    reports: { var: '--platform-danger', icon: AlertTriangle },
    tickets: { var: '--platform-warning', icon: MessageSquare },
    default: { var: '--platform-text-secondary', icon: Activity }
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
};

const StatusBadge = ({ label, icon: Icon, colorVar }) => {
    const style = {
        color: `var(${colorVar})`,
        backgroundColor: `color-mix(in srgb, var(${colorVar}), transparent 90%)`,
        borderColor: `color-mix(in srgb, var(${colorVar}), transparent 80%)`,
        borderWidth: '1px',
        borderStyle: 'solid'
    };
    return (
        <span 
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors duration-300" 
            style={style}
        >
            {Icon && <Icon size={10} style={{ color: `var(${colorVar})` }} />}
            {label}
        </span>
    );
};
const renderStatusBadge = (type, statusInfo) => {
    if (type === 'site_create') {
        const status = statusInfo || 'draft';
        switch (status) {
            case 'published':
                return <StatusBadge label="Published" icon={Globe} colorVar="--platform-success" />;
            case 'suspended':
                return <StatusBadge label="Suspended" icon={Ban} colorVar="--platform-danger" />;
            case 'probation':
                return <StatusBadge label="Probation" icon={Shield} colorVar="--platform-warning" />;
            case 'private':
                return <StatusBadge label="Private" icon={Lock} colorVar="--platform-text-secondary" />;
            case 'draft':
            default:
                return <StatusBadge label="Draft" icon={EyeOff} colorVar="--platform-text-secondary" />;
        }
    }
    if (type === 'user_register') {
        const strikes = statusInfo || 0;
        if (strikes === 0) {
            return <StatusBadge label="Clean" icon={CheckCircle} colorVar="--platform-success" />;
        } else if (strikes === 1) {
            return <StatusBadge label="1 Strike" icon={Zap} colorVar="--platform-warning" />;
        } else {
            return <StatusBadge label={`${strikes}/3 Strikes`} icon={AlertTriangle} colorVar="--platform-danger" />;
        }
    }
    if (type === 'ticket') {
        const status = statusInfo || 'open';
        switch (status) {
            case 'answered':
                return <StatusBadge label="Answered" icon={MessageSquare} colorVar="--platform-success" />;
            case 'closed':
                return <StatusBadge label="Closed" icon={Archive} colorVar="--platform-text-secondary" />;
            case 'open':
            default:
                return <StatusBadge label="Open" icon={Activity} colorVar="--platform-accent" />;
        }
    }
    if (type === 'report') {
        const status = statusInfo || 'new';
        switch (status) {
            case 'reviewed':
                return <StatusBadge label="Reviewed" icon={Check} colorVar="--platform-success" />;
            case 'dismissed':
                return <StatusBadge label="Dismissed" icon={Archive} colorVar="--platform-text-secondary" />;
            case 'banned':
                return <StatusBadge label="Banned" icon={Ban} colorVar="--platform-text-primary" />;
            case 'new':
            default:
                return <StatusBadge label="New" icon={AlertTriangle} colorVar="--platform-danger" />;
        }
    }
    return null;
};
const StatCard = ({ title, value, type, trend, trendValue, loading }) => {
    const styleConfig = ENTITY_STYLES[type] || ENTITY_STYLES.default;
    const Icon = styleConfig.icon;
    const colorVar = styleConfig.var;
    const styles = {
        card: {
            background: 'var(--platform-card-bg)',
            border: '1px solid var(--platform-border-color)',
            borderRadius: '16px',
            padding: '20px', 
            display: 'flex',
            flexDirection: 'column',
            gap: '6px', 
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            height: '100%',
            alignItems: 'center', 
            textAlign: 'center',
            justifyContent: 'center'
        },
        iconBox: {
            width: '42px', height: '42px', borderRadius: '10px', 
            background: `color-mix(in srgb, var(${colorVar}), transparent 90%)`, 
            color: `var(${colorVar})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '4px' 
        },
        value: { 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: 'var(--platform-text-primary)',
            lineHeight: 1.2
        },
        label: { 
            fontSize: '13px', 
            fontWeight: '600', 
            color: 'var(--platform-text-secondary)' 
        },
        trend: { 
            fontSize: '11px', fontWeight: '600', 
            color: trend === 'up' ? 'var(--platform-success)' : trend === 'down' ? 'var(--platform-danger)' : 'var(--platform-text-secondary)',
            display: 'flex', alignItems: 'center', gap: '4px',
            justifyContent: 'center',
            marginTop: '4px',
            padding: '4px 8px',
            borderRadius: '20px',
            background: trend === 'up' 
                ? 'color-mix(in srgb, var(--platform-success), transparent 90%)' 
                : trend === 'down' 
                    ? 'color-mix(in srgb, var(--platform-danger), transparent 90%)' 
                    : 'var(--platform-hover-bg)'
        }
    };
    return (
        <div style={styles.card}>
            <div style={styles.iconBox}><Icon size={22} /></div>
            <div style={styles.value}>{loading ? '...' : value}</div>
            <div style={styles.label}>{title}</div>
            
            {trendValue && (
                <div style={styles.trend}>
                    {trend === 'up' ? <ArrowUpRight size={12}/> : trend === 'down' ? <ArrowDownRight size={12}/> : null}
                    {trendValue}
                </div>
            )}
        </div>
    );
};
const ModernChart = ({ data, period, setPeriod, type, setType }) => {
    const getLabel = (shortDate) => shortDate;
    if (!data || data.length === 0) {
        return (
            <div style={{height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: 'var(--platform-text-secondary)'}}>
                <BarChart2 size={48} opacity={0.2} />
                <span>Немає даних для відображення</span>
            </div>
        );
    }
    const maxVal = Math.max(...data.map(d => Number(d.count || 0)), 5);
    return (
        <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px'}}>
                <div style={{fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--platform-text-primary)'}}>
                    <BarChart2 size={18} color="var(--platform-accent)" />
                    Динаміка активності
                </div>
                <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                    <div style={{ width: '160px' }}>
                        <CustomSelect 
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            options={GRAPH_TYPE_OPTIONS}
                            variant="minimal"
                        />
                    </div>
                    <div style={{ width: '160px' }}>
                        <CustomSelect 
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            options={PERIOD_OPTIONS}
                            variant="minimal"
                        />
                    </div>
                </div>
            </div>

            <div style={{flex: 1, position: 'relative', minHeight: '250px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '24px', borderBottom: '1px solid var(--platform-border-color)'}}>
                {data.map((item, index) => {
                    const count = Number(item.count || 0);
                    const height = (count / maxVal) * 100;
                    const isZero = count === 0;
                    return (
                        <div key={index} style={{flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', position: 'relative', zIndex: 1}} className="group">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-(--platform-text-primary) text-(--platform-bg) text-[11px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg">
                                {item.date}: <strong>{count}</strong>
                            </div>
                            <div style={{
                                width: '100%', maxWidth: period === 30 ? '12px' : '30px', 
                                height: isZero ? '4px' : `${Math.max(height, 2)}%`, 
                                background: isZero ? 'var(--platform-border-color)' : 'var(--platform-accent)',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.4s ease, background 0.2s',
                                opacity: isZero ? 0.3 : 1
                            }} className="hover:brightness-110 cursor-pointer" />
                            <div style={{
                                position: 'absolute', bottom: '-24px', 
                                fontSize: '10px', color: 'var(--platform-text-secondary)',
                                width: '100%', textAlign: 'center', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
                            }}>
                                {(period === 7 || index % 5 === 0) ? getLabel(item.shortDate) : ''}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const LogItem = ({ log }) => {
    let typeKey = 'default';
    if (log.type === 'user_register') typeKey = 'users';
    else if (log.type === 'site_create') typeKey = 'sites';
    else if (log.type === 'report') typeKey = 'reports';
    else if (log.type === 'ticket') typeKey = 'tickets';
    const styleConfig = ENTITY_STYLES[typeKey];
    const Icon = styleConfig.icon;
    const colorVar = styleConfig.var;
    return (
        <div style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', 
            padding: '12px 0', 
            borderBottom: '1px solid var(--platform-border-color)',
            transition: 'background 0.2s'
        }} className="hover:bg-(--platform-hover-bg)">
            <div style={{
                marginTop: '0px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                width: '32px', height: '32px', borderRadius: '8px',
                background: `color-mix(in srgb, var(${colorVar}), transparent 90%)`, 
                color: `var(${colorVar})`,
                flexShrink: 0
            }}>
                <Icon size={18} />
            </div>
            <div style={{flex: 1, minWidth: 0}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px'}}>
                    <div style={{fontSize: '13px', fontWeight: '500', color: 'var(--platform-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '8px'}}>
                        {log.type === 'user_register' && <>Новий користувач <span style={{fontWeight: 'bold'}}>{log.title}</span></>}
                        {log.type === 'site_create' && <>Створено сайт <span style={{fontWeight: 'bold'}}>{log.title}</span></>}
                        {log.type === 'report' && <>Скарга на сайт <span style={{fontWeight: 'bold'}}>{log.title}</span></>}
                        {log.type === 'ticket' && <>Новий тікет <span style={{fontWeight: 'bold'}}>{log.title || `#${log.id}`}</span></>}
                    </div>
                    <div className="shrink-0">
                        {renderStatusBadge(log.type, log.status_info)}
                    </div>
                </div>
                <div style={{fontSize: '11px', color: 'var(--platform-text-secondary)'}}>
                    {formatDate(log.created_at)}
                </div>
            </div>
        </div>
    );
};

const AdminDashboardPage = () => {
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('admin_dashboard_tab') || 'overview';
    });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(30);
    const [graphType, setGraphType] = useState('users');
    const [logTypeFilter, setLogTypeFilter] = useState('all');
    const [logSortOrder, setLogSortOrder] = useState('newest');
    useEffect(() => {
        localStorage.setItem('admin_dashboard_tab', activeTab);
    }, [activeTab]);
    const fetchData = useCallback(async (isRefresh = false) => {
        if (activeTab !== 'overview') return;
        setLoading(true);
        try {
            const response = await apiClient.get('/admin/dashboard-stats', {
                params: { period, type: graphType }
            });
            setData(response.data);
            if (isRefresh) toast.success('Дані оновлено');
        } catch (err) {
            console.error("Помилка завантаження статистики:", err);
            toast.error('Не вдалося завантажити статистику');
        } finally {
            setLoading(false);
        }
    }, [period, graphType, activeTab]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const stats = data?.stats || { users: 0, usersGrowth: 0, sites: 0, reports: 0, tickets: 0 };
    const processedLogs = useMemo(() => {
        if (!data?.activityLog) return [];
        let logs = [...data.activityLog];
        if (logTypeFilter !== 'all') {
            logs = logs.filter(log => {
                if (logTypeFilter === 'user') return log.type === 'user_register';
                if (logTypeFilter === 'site') return log.type === 'site_create';
                if (logTypeFilter === 'report') return log.type === 'report';
                if (logTypeFilter === 'ticket') return log.type === 'ticket';
                return true;
            });
        }
        logs.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return logSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
        return logs;
    }, [data, logTypeFilter, logSortOrder]);

    const tabStyle = (id) => ({
        padding: '8px 24px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        border: 'none',
        background: activeTab === id ? 'var(--platform-text-primary)' : 'transparent',
        color: activeTab === id ? 'var(--platform-bg)' : 'var(--platform-text-secondary)',
        transition: 'all 0.2s'
    });

    return (
        <AdminPageLayout 
            title="Дашборд" 
            icon={LayoutDashboard} 
            onRefresh={() => {
                if (activeTab === 'overview') fetchData(true);
            }} 
            loading={loading && activeTab === 'overview'}
        >
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--platform-border-color)', paddingBottom: '8px', flexShrink: 0 }}>
                <button onClick={() => setActiveTab('overview')} style={tabStyle('overview')}>Огляд</button>
                <button onClick={() => setActiveTab('admins')} style={tabStyle('admins')}>Адміністратори</button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                {activeTab === 'overview' ? (
                    <div 
                        style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '16px', 
                            width: '100%', 
                            height: '100%', 
                            overflowY: 'auto',
                            paddingBottom: '24px' 
                        }} 
                        className="custom-scrollbar"
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', flexShrink: 0 }}>
                            <StatCard 
                                title="Всього користувачів" value={stats.users} type="users"
                                trend="up" trendValue={`+${stats.usersGrowth} за місяць`} loading={loading}
                            />
                            <StatCard 
                                title="Активні сайти" value={stats.sites} type="sites"
                                loading={loading}
                            />
                            <StatCard 
                                title="Скарги (на контент)" value={stats.reports} type="reports"
                                trend={stats.reports > 0 ? "down" : "up"} trendValue={stats.reports > 0 ? "Потребують уваги" : "Все чисто"} loading={loading}
                            />
                            <StatCard 
                                title="Тікети (Підтримка)" value={stats.tickets} type="tickets"
                                trendValue="В черзі" loading={loading}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', flex: 1, minHeight: '400px' }}>
                            <div style={{ 
                                background: 'var(--platform-card-bg)', borderRadius: '16px', padding: '24px', 
                                border: '1px solid var(--platform-border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
                            }}>
                                {loading ? (
                                    <div className="flex flex-1 items-center justify-center text-(--platform-text-secondary)">Завантаження графіка...</div>
                                ) : (
                                    <ModernChart 
                                        data={data?.chartData} 
                                        period={period} setPeriod={setPeriod} 
                                        type={graphType} setType={setGraphType} 
                                    />
                                )}
                            </div>
                            <div style={{ 
                                background: 'var(--platform-card-bg)', borderRadius: '16px', padding: '20px', 
                                border: '1px solid var(--platform-border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
                            }}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px'}}>
                                    <div style={{fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--platform-text-primary)'}}>
                                        <TrendingUp size={18} color="var(--platform-accent)" />
                                        Останні події
                                    </div>
                                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                        <div style={{ width: '150px' }}>
                                            <CustomSelect
                                                value={logTypeFilter}
                                                onChange={(e) => setLogTypeFilter(e.target.value)}
                                                options={LOG_TYPE_OPTIONS}
                                                variant="minimal"
                                            />
                                        </div>
                                        <div style={{ width: '160px' }}>
                                            <CustomSelect
                                                value={logSortOrder}
                                                onChange={(e) => setLogSortOrder(e.target.value)}
                                                options={SORT_OPTIONS}
                                                variant="minimal"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                                    {loading ? (
                                        <div style={{textAlign: 'center', padding: '20px', opacity: 0.5}}>Завантаження...</div>
                                    ) : processedLogs.length > 0 ? (
                                        processedLogs.map((log, index) => <LogItem key={index} log={log} />)
                                    ) : (
                                        <div style={{textAlign: 'center', padding: '40px 20px', opacity: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--platform-text-secondary)'}}>
                                            <Activity size={32} opacity={0.5} />
                                            <span>Подій немає</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        height: '100%', 
                        paddingBottom: '24px' 
                    }}>
                        <AdminLogsPage />
                    </div>
                )}
            </div>
        </AdminPageLayout>
    );
};

export default AdminDashboardPage;