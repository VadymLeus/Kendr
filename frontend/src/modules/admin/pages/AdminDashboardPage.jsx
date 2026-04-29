// frontend/src/modules/admin/pages/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../../shared/api/api';
import CustomSelect from '../../../shared/ui/elements/CustomSelect'; 
import AdminPageLayout from '../components/AdminPageLayout';
import AdminLogsPage from '../components/AdminLogsPage'; 
import LoadingState from '../../../shared/ui/complex/LoadingState';
import { AuthContext } from '../../../app/providers/AuthContext';
import { Users, Globe, AlertTriangle, MessageSquare, LayoutDashboard, TrendingUp, BarChart2, ArrowUpRight, ArrowDownRight, Calendar, Activity, Zap, Check, Ban, Lock, EyeOff, Shield, Archive, CheckCircle } from 'lucide-react';

const GRAPH_TYPE_OPTIONS = [
    { label: 'Користувачі', value: 'users', icon: Users },
    { label: 'Сайти', value: 'sites', icon: Globe },
    { label: 'Тікети', value: 'tickets', icon: MessageSquare },
    { label: 'Скарги', value: 'reports', icon: AlertTriangle } 
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
            {Icon && <Icon size={10} style={{ color: `var(${colorVar})` }} className="shrink-0" />}
            <span className="truncate max-w-15 sm:max-w-none">{label}</span>
        </span>
    );
};

const renderStatusBadge = (type, statusInfo) => {
    if (type === 'site_create') {
        const status = statusInfo || 'maintenance';
        switch (status) {
            case 'published': return <StatusBadge label="Published" icon={Globe} colorVar="--platform-success" />;
            case 'suspended': return <StatusBadge label="Suspended" icon={Ban} colorVar="--platform-danger" />;
            case 'probation': return <StatusBadge label="Probation" icon={Shield} colorVar="--platform-warning" />;
            case 'private':   return <StatusBadge label="Private" icon={Lock} colorVar="--platform-text-secondary" />;
            case 'maintenance':
            default:          return <StatusBadge label="Maintenance" icon={EyeOff} colorVar="--platform-text-secondary" />;
        }
    }
    if (type === 'user_register') {
        const strikes = statusInfo || 0;
        if (strikes === 0) return <StatusBadge label="Clean" icon={CheckCircle} colorVar="--platform-success" />;
        else if (strikes === 1) return <StatusBadge label="1 Strike" icon={Zap} colorVar="--platform-warning" />;
        else return <StatusBadge label={`${strikes}/3 Strikes`} icon={AlertTriangle} colorVar="--platform-danger" />;
    }
    if (type === 'ticket') {
        const status = statusInfo || 'open';
        switch (status) {
            case 'answered': return <StatusBadge label="Answered" icon={MessageSquare} colorVar="--platform-success" />;
            case 'closed':   return <StatusBadge label="Closed" icon={Archive} colorVar="--platform-text-secondary" />;
            case 'open':
            default:         return <StatusBadge label="Open" icon={Activity} colorVar="--platform-accent" />;
        }
    }
    if (type === 'report') {
        const status = statusInfo || 'new';
        switch (status) {
            case 'reviewed':  return <StatusBadge label="Reviewed" icon={Check} colorVar="--platform-success" />;
            case 'dismissed': return <StatusBadge label="Dismissed" icon={Archive} colorVar="--platform-text-secondary" />;
            case 'banned':    return <StatusBadge label="Banned" icon={Ban} colorVar="--platform-text-primary" />;
            case 'new':
            default:          return <StatusBadge label="New" icon={AlertTriangle} colorVar="--platform-danger" />;
        }
    }
    return null;
};

const StatCard = ({ title, value, type, trend, trendValue, loading }) => {
    const styleConfig = ENTITY_STYLES[type] || ENTITY_STYLES.default;
    const Icon = styleConfig.icon;
    const colorVar = styleConfig.var;
    return (
        <div className="flex flex-col relative overflow-hidden items-center text-center justify-center h-full bg-(--platform-card-bg) border border-(--platform-border-color) rounded-2xl p-3 sm:p-5 gap-1.5 sm:gap-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div 
                className="flex items-center justify-center shrink-0 rounded-lg sm:rounded-xl mb-0.5 sm:mb-1 w-8 h-8 sm:w-10.5 sm:h-10.5"
                style={{
                    background: `color-mix(in srgb, var(${colorVar}), transparent 90%)`, 
                    color: `var(${colorVar})`
                }}
            >
                <Icon className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
            </div>
            <div className="text-xl sm:text-[28px] font-bold text-(--platform-text-primary) leading-tight">
                {loading ? '...' : value}
            </div>
            <div className="text-[11px] sm:text-[13px] font-semibold text-(--platform-text-secondary) leading-tight">
                {title}
            </div>
            {trendValue && (
                <div 
                    className="flex items-center justify-center gap-1 mt-0.5 sm:mt-1 px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-semibold"
                    style={{
                        color: trend === 'up' ? 'var(--platform-success)' : trend === 'down' ? 'var(--platform-danger)' : 'var(--platform-text-secondary)',
                        background: trend === 'up' 
                            ? 'color-mix(in srgb, var(--platform-success), transparent 90%)' 
                            : trend === 'down' 
                                ? 'color-mix(in srgb, var(--platform-danger), transparent 90%)' 
                                : 'var(--platform-hover-bg)'
                    }}
                >
                    {trend === 'up' ? <ArrowUpRight size={10} className="shrink-0 sm:w-3 sm:h-3"/> : trend === 'down' ? <ArrowDownRight size={10} className="shrink-0 sm:w-3 sm:h-3"/> : null}
                    <span className="truncate">{trendValue}</span>
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
                <span className="text-center px-4">Немає даних для відображення</span>
            </div>
        );
    }
    const maxVal = Math.max(...data.map(d => Number(d.count || 0)), 5);
    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-3 w-full">
                <div className="text-[16px] font-bold flex items-center gap-2 text-(--platform-text-primary) shrink-0">
                    <BarChart2 size={18} color="var(--platform-accent)" className="shrink-0" />
                    Динаміка активності
                </div>
                <div className="flex gap-2 flex-1 min-w-60 justify-start sm:justify-end">
                    <div className="flex-1 sm:flex-none sm:w-40">
                        <CustomSelect 
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            options={GRAPH_TYPE_OPTIONS}
                            variant="minimal"
                            style={{ height: '36px', background: 'var(--platform-bg)' }}
                        />
                    </div>
                    <div className="flex-1 sm:flex-none sm:w-40">
                        <CustomSelect 
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            options={PERIOD_OPTIONS}
                            variant="minimal"
                            style={{ height: '36px', background: 'var(--platform-bg)' }}
                        />
                    </div>
                </div>
            </div>
            <div className="flex-1 relative min-h-50 sm:min-h-62.5 flex items-end gap-1 sm:gap-2 pb-6 border-b border-(--platform-border-color) w-full overflow-x-auto hide-scrollbar">
                {data.map((item, index) => {
                    const count = Number(item.count || 0);
                    const height = (count / maxVal) * 100;
                    const isZero = count === 0;
                    return (
                        <div key={index} className="flex-1 h-full flex flex-col justify-end items-center relative z-10 group min-w-2 sm:min-w-0">
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
        <div className="flex items-center gap-3 py-3 border-b border-(--platform-border-color) transition-colors hover:bg-(--platform-hover-bg)">
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                width: '32px', height: '32px', borderRadius: '8px',
                background: `color-mix(in srgb, var(${colorVar}), transparent 90%)`, 
                color: `var(${colorVar})`,
                flexShrink: 0
            }}>
                <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start sm:items-center justify-between gap-2 mb-0.5 flex-col sm:flex-row">
                    <div className="text-[13px] font-medium text-(--platform-text-primary) truncate pr-2 max-w-full">
                        {log.type === 'user_register' && <>Новий користувач <span className="font-bold">{log.title}</span></>}
                        {log.type === 'site_create' && <>Створено сайт <span className="font-bold">{log.title}</span></>}
                        {log.type === 'report' && <>Скарга на сайт <span className="font-bold">{log.title}</span></>}
                        {log.type === 'ticket' && <>Новий тікет <span className="font-bold">{log.title || `#${log.id}`}</span></>}
                    </div>
                    <div className="shrink-0">
                        {renderStatusBadge(log.type, log.status_info)}
                    </div>
                </div>
                <div className="text-[11px] text-(--platform-text-secondary)">
                    {formatDate(log.created_at)}
                </div>
            </div>
        </div>
    );
};

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'admin';
    const [activeTab, setActiveTab] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get('tab') === 'logs' && isAdmin ? 'logs' : 'overview';
    });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(30);
    const [graphType, setGraphType] = useState('users');
    const [logTypeFilter, setLogTypeFilter] = useState('all');
    const [logSortOrder, setLogSortOrder] = useState('newest');
    const [logsRefreshCounter, setLogsRefreshCounter] = useState(0);
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('tab') !== activeTab) {
            navigate({ search: `?tab=${activeTab}` }, { replace: true });
        }
    }, [activeTab, navigate, location.search]);
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

    return (
        <AdminPageLayout 
            title="Дашборд" 
            icon={LayoutDashboard}
            onRefresh={() => {
                if (activeTab === 'overview') {
                    fetchData(true);
                } else if (activeTab === 'logs') {
                    setLogsRefreshCounter(prev => prev + 1);
                    toast.success('Логи оновлено');
                }
            }} 
            loading={loading && activeTab === 'overview'}
        >
            {isAdmin && (
                <div className="flex p-1 bg-(--platform-bg) rounded-xl border border-(--platform-border-color) w-full sm:w-fit mb-4 sm:mb-6 overflow-x-auto hide-scrollbar shrink-0">
                    <button
                        className={`flex-1 sm:flex-none h-9 sm:h-10 px-4 rounded-lg text-[13px] sm:text-sm font-medium flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-(--platform-card-bg) text-(--platform-text-primary) shadow-sm' : 'text-(--platform-text-secondary) hover:text-(--platform-text-primary)'}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <LayoutDashboard size={16} /> Огляд
                    </button>
                    <button
                        className={`flex-1 sm:flex-none h-9 sm:h-10 px-4 rounded-lg text-[13px] sm:text-sm font-medium flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'logs' ? 'bg-(--platform-card-bg) text-(--platform-text-primary) shadow-sm' : 'text-(--platform-text-secondary) hover:text-(--platform-text-primary)'}`}
                        onClick={() => setActiveTab('logs')}
                    >
                        <Shield size={16} /> Логи дій
                    </button>
                </div>
            )}
            
            <div className="flex-1 relative overflow-hidden flex flex-col h-full w-full">
                {activeTab === 'overview' ? (
                    <div className="flex flex-col gap-4 w-full h-full overflow-y-auto pb-6 custom-scrollbar pr-1 sm:pr-2">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0">
                            <StatCard 
                                title="Всього користувачів" value={stats.users} type="users"
                                trend="up" trendValue={`+${stats.usersGrowth} за місяць`} loading={loading}
                            />
                            <StatCard 
                                title="Активні сайти" value={stats.sites} type="sites"
                                loading={loading}
                            />
                            <StatCard 
                                title="Скарги" value={stats.reports} type="reports"
                                trend={stats.reports > 0 ? "down" : "up"} trendValue={stats.reports > 0 ? "Потребують уваги" : "Все чисто"} loading={loading}
                            />
                            <StatCard 
                                title="Тікети" value={stats.tickets} type="tickets"
                                trendValue="В черзі" loading={loading}
                            />
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-100">
                            <div className="xl:col-span-2 bg-(--platform-card-bg) rounded-2xl p-4 sm:p-6 border border-(--platform-border-color) flex flex-col overflow-hidden min-h-87.5">
                                {loading ? (
                                    <LoadingState title="Завантаження графіка..." layout="section" iconSize={40} />
                                ) : (
                                    <ModernChart 
                                        data={data?.chartData} 
                                        period={period} setPeriod={setPeriod} 
                                        type={graphType} setType={setGraphType} 
                                    />
                                )}
                            </div>
                            <div className="xl:col-span-1 bg-(--platform-card-bg) rounded-2xl p-4 sm:p-5 border border-(--platform-border-color) flex flex-col overflow-hidden min-h-87.5">
                                
                                <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row justify-between items-start sm:items-center xl:items-start 2xl:items-center gap-3 mb-4">
                                    <div className="text-[16px] font-bold flex items-center gap-2 text-(--platform-text-primary) shrink-0">
                                        <TrendingUp size={18} color="var(--platform-accent)" className="shrink-0" />
                                        Останні події
                                    </div>
                                    <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row gap-2 w-full sm:w-auto xl:w-full 2xl:w-auto">
                                        <div className="w-full sm:w-32 xl:w-full 2xl:w-32 shrink-0">
                                            <CustomSelect
                                                value={logTypeFilter}
                                                onChange={(e) => setLogTypeFilter(e.target.value)}
                                                options={LOG_TYPE_OPTIONS}
                                                variant="minimal"
                                                style={{ height: '36px', background: 'var(--platform-bg)' }}
                                            />
                                        </div>
                                        <div className="w-full sm:w-36 xl:w-full 2xl:w-36 shrink-0">
                                            <CustomSelect
                                                value={logSortOrder}
                                                onChange={(e) => setLogSortOrder(e.target.value)}
                                                options={SORT_OPTIONS}
                                                variant="minimal"
                                                style={{ height: '36px', background: 'var(--platform-bg)' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-50">
                                    {loading ? (
                                        <LoadingState title="Завантаження подій..." layout="section" iconSize={32} />
                                    ) : processedLogs.length > 0 ? (
                                        processedLogs.map((log, index) => <LogItem key={index} log={log} />)
                                    ) : (
                                        <div className="text-center p-10 opacity-50 flex flex-col items-center gap-2 text-(--platform-text-secondary)">
                                            <Activity size={32} opacity={0.5} />
                                            <span>Подій немає</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'logs' && isAdmin ? (
                    <div className="flex flex-col h-full pb-6 w-full">
                        <AdminLogsPage key={logsRefreshCounter} />
                    </div>
                ) : null}
            </div>
        </AdminPageLayout>
    );
};

export default AdminDashboardPage;