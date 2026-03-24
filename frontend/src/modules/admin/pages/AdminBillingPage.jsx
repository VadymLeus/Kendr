// frontend/src/modules/admin/pages/AdminBillingPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../../shared/api/api';
import { Input } from '../../../shared/ui/elements/Input';
import CustomSelect from '../../../shared/ui/elements/CustomSelect';
import { Button } from '../../../shared/ui/elements/Button';
import DateRangePicker from '../../../shared/ui/elements/DateRangePicker';
import AdminPageLayout from '../components/AdminPageLayout';
import BillingDetailsPanel from '../components/BillingDetailsPanel';
import { AdminTable, AdminTh, AdminRow, AdminCell, LoadingRow, EmptyRow, FilterBar, GenericBadge, CsvExportButton } from '../components/AdminTableComponents';
import { exportToCsv } from '../../../shared/utils/exportToCsv';
import { CreditCard, Search, CheckCircle, Clock, XCircle, RotateCcw, DollarSign, TrendingUp, Activity, Store, Package, Inbox, Ban, ExternalLink, Globe } from 'lucide-react';

const STATUS_CONFIG = {
    success: { bg: 'color-mix(in srgb, var(--platform-success), transparent 90%)', color: 'var(--platform-success)', label: 'Успішно', icon: CheckCircle },
    completed: { bg: 'color-mix(in srgb, var(--platform-success), transparent 90%)', color: 'var(--platform-success)', label: 'Виконано', icon: CheckCircle },
    paid: { bg: 'color-mix(in srgb, var(--platform-success), transparent 90%)', color: 'var(--platform-success)', label: 'Оплачено', icon: DollarSign },
    shipped: { bg: 'color-mix(in srgb, var(--platform-accent), transparent 90%)', color: 'var(--platform-accent)', label: 'Відправлено', icon: Package },
    pending: { bg: 'color-mix(in srgb, var(--platform-warning), transparent 90%)', color: 'var(--platform-warning)', label: 'В очікуванні', icon: Clock },
    failed: { bg: 'color-mix(in srgb, var(--platform-danger), transparent 90%)', color: 'var(--platform-danger)', label: 'Помилка', icon: XCircle },
    cancelled: { bg: 'color-mix(in srgb, var(--platform-danger), transparent 90%)', color: 'var(--platform-danger)', label: 'Скасовано', icon: Ban },
    refunded: { bg: 'var(--platform-hover-bg)', color: 'var(--platform-text-secondary)', label: 'Повернення', icon: RotateCcw }
};

const PLATFORM_STATUS_OPTIONS = [
    { value: 'all', label: 'Всі статуси', icon: Inbox },
    { value: 'success', label: 'Успішні', icon: CheckCircle },
    { value: 'pending', label: 'В очікуванні', icon: Clock },
    { value: 'failed', label: 'Помилка', icon: XCircle }
];

const USER_STATUS_OPTIONS = [
    { value: 'all', label: 'Всі статуси', icon: Inbox },
    { value: 'paid', label: 'Оплачено', icon: DollarSign },
    { value: 'shipped', label: 'Відправлено', icon: Package },
    { value: 'completed', label: 'Виконано', icon: CheckCircle },
    { value: 'pending', label: 'В очікуванні', icon: Clock },
    { value: 'cancelled', label: 'Скасовано', icon: Ban }
];

const AdminBillingPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('platform');
    const [viewMode, setViewMode] = useState('list');
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const endpoint = activeTab === 'platform' ? '/admin/transactions' : '/admin/orders';
            const res = await apiClient.get(endpoint, {
                params: { 
                    page, 
                    limit: 15, 
                    status: statusFilter, 
                    search: debouncedSearch,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined
                }
            });
            setData(activeTab === 'platform' ? res.data.transactions : res.data.orders);
            setSummary(res.data.summary);
            setTotalPages(res.data.pagination.totalPages);
            setTotalCount(res.data.pagination.total);
        } catch (error) {
            toast.error("Не вдалося завантажити дані");
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [activeTab, page, statusFilter, debouncedSearch, startDate, endDate]);
    const handleTabChange = (tab) => {
        if (activeTab === tab) return;
        setIsLoading(true);
        setData([]); 
        setSummary(null);
        setActiveTab(tab);
        setPage(1);
        setSearchQuery('');
        setDebouncedSearch('');
        setStatusFilter('all');
        setStartDate('');
        setEndDate('');
        setSelectedItem(null);
    };

    const handleSort = (key) => {
        setSortConfig(c => ({
            key,
            direction: c.key === key && c.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const clearDateFilter = () => {
        setStartDate('');
        setEndDate('');
    };

    const processedData = useMemo(() => {
        let res = [...data];
        return res.sort((a, b) => {
            let valA = a[sortConfig.key] || '';
            let valB = b[sortConfig.key] || '';
            
            if (sortConfig.key === 'amount') {
                valA = Number(valA) || 0;
                valB = Number(valB) || 0;
            }

            return (valA < valB ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1);
        });
    }, [data, sortConfig]);

    const handleExport = () => {
        if (!processedData?.length) return toast.info('Немає даних для експорту');
        if (activeTab === 'platform') {
            exportToCsv(processedData.map(item => ({
                id: item.id,
                user: item.user_name,
                email: item.user_email,
                description: item.description,
                date: new Date(item.created_at).toLocaleString('uk-UA'),
                amount: `${item.amount} ${item.currency}`,
                status: STATUS_CONFIG[item.status]?.label || item.status
            })), {
                id: 'ID', user: 'Платник', email: 'Email', description: 'Опис', date: 'Дата', amount: 'Сума', status: 'Статус'
            }, `platform_transactions_${new Date().toLocaleDateString('uk-UA')}`);
        } else {
            exportToCsv(processedData.map(item => ({
                id: item.id,
                customer: item.customer_name,
                email: item.customer_email,
                site: item.site_title,
                owner: item.owner_email,
                date: new Date(item.created_at).toLocaleString('uk-UA'),
                amount: `${item.amount} ${item.currency}`,
                status: STATUS_CONFIG[item.status]?.label || item.status
            })), {
                id: 'ID', customer: 'Покупець', email: 'Email покупця', site: 'Сайт', owner: 'Власник сайту', date: 'Дата', amount: 'Сума', status: 'Статус'
            }, `users_orders_${new Date().toLocaleDateString('uk-UA')}`);
        }
    };

    const Widget = ({ title, value, icon, colorClass }) => (
        <div className="bg-(--platform-card-bg) p-5 rounded-xl border border-(--platform-border-color) shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${colorClass}`}>{icon}</div>
            <div>
                <p className="text-sm text-(--platform-text-secondary) font-medium">{title}</p>
                <h4 className="text-2xl font-bold text-(--platform-text-primary) m-0">{value}</h4>
            </div>
        </div>
    );
    return (
        <AdminPageLayout 
            title="Фінансовий моніторинг" 
            icon={CreditCard} 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
            onRefresh={fetchData} 
            loading={isLoading}
        >
            <div className="flex p-1 bg-(--platform-bg) rounded-xl border border-(--platform-border-color) w-fit mb-6">
                <button
                    className={`py-2 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'platform' ? 'bg-(--platform-card-bg) text-(--platform-text-primary) shadow-sm' : 'text-(--platform-text-secondary) hover:text-(--platform-text-primary)'}`}
                    onClick={() => handleTabChange('platform')}
                >
                    <CreditCard size={16} /> Доходи платформи
                </button>
                <button
                    className={`py-2 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'users' ? 'bg-(--platform-card-bg) text-(--platform-text-primary) shadow-sm' : 'text-(--platform-text-secondary) hover:text-(--platform-text-primary)'}`}
                    onClick={() => handleTabChange('users')}
                >
                    <Store size={16} /> Продажі користувачів
                </button>
            </div>
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                    <Widget 
                        title="Оборот" 
                        value={`${summary.totalEarned} ₴`} 
                        icon={<DollarSign size={24} />} 
                        colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                    />
                    <Widget 
                        title="Успішні" 
                        value={summary.successfulThisMonth} 
                        icon={<TrendingUp size={24} />} 
                        colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                    />
                    <Widget 
                        title="Всього" 
                        value={totalCount} 
                        icon={<Activity size={24} />} 
                        colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" 
                    />
                </div>
            )}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <FilterBar>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ width: '180px' }}>
                            <CustomSelect 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)} 
                                options={activeTab === 'platform' ? PLATFORM_STATUS_OPTIONS : USER_STATUS_OPTIONS} 
                                placeholder="Статус" 
                                style={{ height: '36px', background: 'var(--platform-card-bg)' }} 
                            />
                        </div>
                        <DateRangePicker 
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={setStartDate}
                            onEndDateChange={setEndDate}
                            onClear={clearDateFilter}
                        />
                    </div>
                </FilterBar>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '300px' }}>
                        <Input 
                            placeholder={activeTab === 'platform' ? "Пошук за ID або Email..." : "Пошук за ID, Email або Сайтом..."} 
                            leftIcon={<Search size={16}/>} 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            wrapperStyle={{margin: 0}} 
                        />
                    </div>
                    <CsvExportButton onClick={handleExport} disabled={isLoading || !processedData.length} />
                </div>
            </div>
            {viewMode === 'list' ? (
                <div className="bg-(--platform-card-bg) rounded-xl border border-(--platform-border-color) shadow-sm overflow-hidden flex flex-col">
                    <AdminTable>
                        <colgroup>
                            <col style={{width: '22%'}} />
                            <col style={{width: '20%'}} />
                            <col style={{width: '20%'}} />
                            <col style={{width: '13%'}} />
                            <col style={{width: '10%'}} />
                            <col style={{width: '15%'}} />
                        </colgroup>
                        <thead>
                            <tr>
                                <AdminTh label="ID" sortKey="id" currentSort={sortConfig} onSort={handleSort} />
                                <AdminTh label={activeTab === 'platform' ? 'Платник' : 'Покупець'} sortKey={activeTab === 'platform' ? 'user_name' : 'customer_name'} currentSort={sortConfig} onSort={handleSort} />
                                <AdminTh label={activeTab === 'platform' ? 'Опис' : 'Сайт (Власник)'} sortKey={activeTab === 'platform' ? 'description' : 'site_title'} currentSort={sortConfig} onSort={handleSort} />
                                <AdminTh label="Дата" sortKey="created_at" currentSort={sortConfig} onSort={handleSort} />
                                <AdminTh label="Сума" sortKey="amount" currentSort={sortConfig} onSort={handleSort} />
                                <AdminTh label="Статус" align="right" sortKey="status" currentSort={sortConfig} onSort={handleSort} />
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? <LoadingRow cols={6} /> : !processedData.length ? <EmptyRow cols={6} /> : processedData.map((item) => {
                                const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                                return (
                                    <AdminRow key={item.id} onClick={() => setSelectedItem(item)} isSelected={selectedItem?.id === item.id}>
                                        <AdminCell style={{opacity: 0.6, fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all'}}>
                                            {item.id}
                                        </AdminCell>
                                        <AdminCell>
                                            {activeTab === 'platform' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <div 
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${item.user_slug || item.user_name}`); }}
                                                        style={{ fontWeight: '600', color: 'var(--platform-text-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}
                                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--platform-accent)'}
                                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--platform-text-primary)'}
                                                    >
                                                        {item.user_name} <ExternalLink size={12} style={{ opacity: 0.5 }} />
                                                    </div>
                                                    <div style={{fontSize: '12px', color: 'var(--platform-text-secondary)'}}>{item.user_email}</div>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <div style={{fontWeight: '600', color: 'var(--platform-text-primary)'}}>{item.customer_name}</div>
                                                    <div style={{fontSize: '12px', color: 'var(--platform-text-secondary)'}}>{item.customer_email}</div>
                                                </div>
                                            )}
                                        </AdminCell>
                                        <AdminCell>
                                            {activeTab === 'platform' ? (
                                                <div style={{fontSize: '13px', color: 'var(--platform-text-secondary)'}} title={item.description}>
                                                    {item.description}
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <div 
                                                        onClick={(e) => { e.stopPropagation(); window.open(`/site/${item.site_path}`, '_blank'); }}
                                                        style={{ fontWeight: '600', color: 'var(--platform-text-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}
                                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--platform-accent)'}
                                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--platform-text-primary)'}
                                                    >
                                                        <Globe size={12} style={{ opacity: 0.5 }} /> {item.site_title}
                                                    </div>
                                                    <div 
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${item.owner_slug || item.owner_name}`); }}
                                                        style={{fontSize: '12px', color: 'var(--platform-accent)', cursor: 'pointer', display: 'inline-block'}}
                                                        title={`Продавець: ${item.owner_email}`}
                                                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                                                    >
                                                        @{item.owner_email.split('@')[0]}
                                                    </div>
                                                </div>
                                            )}
                                        </AdminCell>
                                        <AdminCell>
                                            <div style={{fontSize: '13px', color: 'var(--platform-text-primary)'}}>
                                                {new Date(item.created_at).toLocaleDateString('uk-UA')}
                                            </div>
                                            <div style={{fontSize: '11px', color: 'var(--platform-text-secondary)'}}>
                                                {new Date(item.created_at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </AdminCell>
                                        <AdminCell>
                                            <div style={{fontWeight: 'bold', color: 'var(--platform-text-primary)'}}>
                                                {Number(item.amount).toFixed(2)} <span style={{fontSize: '12px', opacity: 0.7}}>{item.currency}</span>
                                            </div>
                                        </AdminCell>
                                        <AdminCell align="right">
                                            <GenericBadge bg={st.bg} color={st.color} icon={st.icon}>
                                                {st.label}
                                            </GenericBadge>
                                        </AdminCell>
                                    </AdminRow>
                                );
                            })}
                        </tbody>
                    </AdminTable>
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-(--platform-border-color) flex justify-between items-center bg-(--platform-bg)/50">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={page === 1} 
                                onClick={() => setPage(p => p - 1)}
                            >
                                Попередня
                            </Button>
                            <span className="text-sm font-medium text-(--platform-text-secondary)">
                                Сторінка <span className="text-(--platform-text-primary)">{page}</span> з {totalPages}
                            </span>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={page === totalPages} 
                                onClick={() => setPage(p => p + 1)}
                            >
                                Наступна
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--platform-text-secondary)' }}>
                    Режим сітки для транзакцій недоступний
                </div>
            )}
            <BillingDetailsPanel 
                item={selectedItem} 
                type={activeTab} 
                onClose={() => setSelectedItem(null)} 
            />
            
        </AdminPageLayout>
    );
};

export default AdminBillingPage;