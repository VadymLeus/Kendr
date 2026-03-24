// frontend/src/modules/features/shop/OrdersTab.jsx
import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../../../shared/api/api';
import { toast } from 'react-toastify';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import { Input } from '../../../../shared/ui/elements/Input';
import { Button } from '../../../../shared/ui/elements/Button';
import DateRangePicker from '../../../../shared/ui/elements/DateRangePicker';
import EmptyState from '../../../../shared/ui/complex/EmptyState';
import LoadingState from '../../../../shared/ui/complex/LoadingState';
import { Package, MapPin, User, Calendar, Search } from 'lucide-react';

const STATUS_MAP = {
    'pending': { label: 'Очікує оплати', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-500' },
    'paid': { label: 'Оплачено (В обробці)', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-500' },
    'shipped': { label: 'Відправлено', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-500' },
    'completed': { label: 'Виконано', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-500' },
    'cancelled': { label: 'Скасовано', color: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-500' }
};

const STATUS_OPTIONS = Object.entries(STATUS_MAP)
    .filter(([key]) => key !== 'pending')
    .map(([key, val]) => ({
        value: key,
        label: val.label
    }));

const FILTER_STATUS_OPTIONS = [
    { value: 'all', label: 'Всі статуси' },
    ...Object.entries(STATUS_MAP).map(([key, val]) => ({
        value: key,
        label: val.label
    }))
];

const FILTER_TYPE_OPTIONS = [
    { value: 'all', label: 'Всі типи' },
    { value: 'digital', label: 'Тільки цифрові' },
    { value: 'physical', label: 'Містять фізичні' }
];

const SORT_FIELDS = [
    { value: 'date', label: 'За датою' },
    { value: 'amount', label: 'За сумою' },
    { value: 'id', label: 'За номером' }
];

const OrdersTab = ({ site, siteData }) => {
    const currentSite = site || siteData;
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    useEffect(() => {
        if (!currentSite?.id) {
            setLoading(false);
            return;
        }
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get(`/orders/site/${currentSite.id}`);
                setOrders(res.data || []);
            } catch (err) {
                console.error(err);
                toast.error('Не вдалося завантажити замовлення');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentSite]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            toast.success('Статус замовлення оновлено');
        } catch (error) {
            console.error('Помилка оновлення статусу:', error);
            toast.error('Не вдалося оновити статус');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} о ${hours}:${minutes}`;
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setTypeFilter('all');
        setStartDate('');
        setEndDate('');
    };

    const getStatusControl = (order) => {
        const hasItems = order.items && order.items.length > 0;
        const isDigitalOnly = hasItems && order.items.every(item => item.type === 'digital');
        const isDisabled = order.status === 'pending' || isDigitalOnly;
        const config = STATUS_MAP[order.status] || STATUS_MAP['pending'];
        if (isDisabled) {
            return (
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-1.5 ${config.color}`}>
                    {config.label}
                    {isDigitalOnly && order.status !== 'pending' && order.status !== 'cancelled' && (
                        <span className="opacity-75 text-[10px] uppercase tracking-wider">(Авто)</span>
                    )}
                </span>
            );
        }
        return (
            <div className="w-50">
                <CustomSelect
                    name="status"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    options={STATUS_OPTIONS}
                />
            </div>
        );
    };

    const processedOrders = useMemo(() => {
        let result = [...orders];
        if (search.trim()) {
            const query = search.toLowerCase();
            result = result.filter(o =>
                o.id.toString().toLowerCase().includes(query) ||
                (o.customer_name || '').toLowerCase().includes(query) ||
                (o.customer_email || '').toLowerCase().includes(query) ||
                (o.customer_phone || '').includes(query)
            );
        }
        if (statusFilter !== 'all') {
            result = result.filter(o => o.status === statusFilter);
        }
        if (typeFilter === 'digital') {
            result = result.filter(o => o.items && o.items.length > 0 && o.items.every(item => item.type === 'digital'));
        } else if (typeFilter === 'physical') {
            result = result.filter(o => o.items && o.items.some(item => item.type !== 'digital'));
        }
        if (startDate) {
            const start = new Date(`${startDate}T00:00:00`);
            result = result.filter(o => new Date(o.created_at) >= start);
        }
        if (endDate) {
            const end = new Date(`${endDate}T23:59:59`);
            result = result.filter(o => new Date(o.created_at) <= end);
        }
        result.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'date') {
                comparison = new Date(a.created_at) - new Date(b.created_at);
            } else if (sortBy === 'amount') {
                comparison = parseFloat(a.total_amount) - parseFloat(b.total_amount);
            } else if (sortBy === 'id') {
                comparison = a.id.toString().localeCompare(b.id.toString());
            }
            return sortOrder === 'asc' ? comparison : comparison * -1;
        });
        
        return result;
    }, [orders, search, statusFilter, typeFilter, startDate, endDate, sortBy, sortOrder]);
    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };
    if (loading) {
        return <LoadingState title="Завантаження замовлень..." />;
    }
    if (orders.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-(--platform-text-primary)">
                <EmptyState 
                    title="Замовлень поки немає"
                    description="Коли клієнти зроблять покупку, вони з'являться тут."
                    icon={Package}
                />
            </div>
        );
    }
    return (
        <div className="px-6 pb-6 pt-2 h-full overflow-y-auto custom-scrollbar bg-(--platform-bg)">
            <div className="mb-6 shrink-0 flex flex-col items-center text-center">
                <h2 className="text-2xl font-semibold m-0 mb-1 text-(--platform-text-primary) flex items-center justify-center gap-2.5">
                    <Package size={28} />
                    Замовлення
                </h2>
                <p className="text-(--platform-text-secondary) m-0 text-sm">
                    Перегляд та управління замовленнями клієнтів
                </p>
            </div>
            <div className="mb-6 p-4 bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
                <div className="flex-1 min-w-60">
                    <Input
                        leftIcon={<Search size={16} />}
                        placeholder="Пошук за номером, іменем, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        wrapperStyle={{ margin: 0 }}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <DateRangePicker 
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        onClear={() => {setStartDate(''); setEndDate('');}}
                    />
                    <div className="w-44">
                        <CustomSelect
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={FILTER_STATUS_OPTIONS}
                        />
                    </div>
                    <div className="w-44">
                        <CustomSelect
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            options={FILTER_TYPE_OPTIONS}
                        />
                    </div>
                    <div className="w-40">
                        <CustomSelect
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            options={SORT_FIELDS}
                        />
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={toggleSortOrder} 
                        className="w-10.5 h-10.5 p-0 flex items-center justify-center shrink-0"
                        title={sortOrder === 'desc' ? "За спаданням" : "За зростанням"}
                    >
                        <span className="text-lg leading-none">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                    </Button>
                </div>
            </div>

            {processedOrders.length === 0 ? (
                <div className="py-10">
                    <EmptyState 
                        title="Замовлень не знайдено"
                        description="За вашим запитом або фільтрами нічого не знайдено. Спробуйте змінити критерії пошуку."
                        icon={Search}
                        action={
                            (search || statusFilter !== 'all' || typeFilter !== 'all' || startDate || endDate) && (
                                <Button 
                                    variant="ghost" 
                                    onClick={clearFilters}
                                >
                                    Очистити фільтри
                                </Button>
                            )
                        }
                    />
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {processedOrders.map(order => (
                        <div key={order.id} className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl p-5 shadow-sm">
                            <div className="flex justify-between items-start border-b border-(--platform-border-color) pb-4 mb-4 flex-wrap gap-4">
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <span className="font-bold text-lg text-(--platform-text-primary)">Замовлення #{order.id}</span>
                                        {getStatusControl(order)}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-(--platform-text-secondary)">
                                        <span className="flex items-center gap-1.5"><Calendar size={14}/> {formatDate(order.created_at)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-(--platform-text-secondary) mb-1">Сума замовлення</div>
                                    <div className="text-xl font-bold text-(--platform-text-primary)">{parseFloat(order.total_amount).toFixed(2)} ₴</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-(--platform-hover-bg) p-4 rounded-lg text-sm text-(--platform-text-primary)">
                                    <h4 className="font-bold mb-3 flex items-center gap-2 border-b border-(--platform-border-color) pb-2"><User size={16}/> Дані клієнта</h4>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2"><span className="text-(--platform-text-secondary) w-20">Ім'я:</span> <span className="font-medium">{order.customer_name}</span></div>
                                        <div className="flex gap-2"><span className="text-(--platform-text-secondary) w-20">Email:</span> <a href={`mailto:${order.customer_email}`} className="text-(--platform-accent) hover:underline">{order.customer_email}</a></div>
                                        <div className="flex gap-2"><span className="text-(--platform-text-secondary) w-20">Телефон:</span> <span>{order.customer_phone || '-'}</span></div>
                                        <div className="flex gap-2 mt-2 pt-2 border-t border-(--platform-border-color)/50">
                                            <MapPin size={16} className="text-(--platform-text-secondary) shrink-0 mt-0.5"/> 
                                            <span className={order.delivery_address === 'Цифрова доставка' ? 'text-blue-500 font-medium' : ''}>
                                                {order.delivery_address || 'Не вказано'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-3 text-sm text-(--platform-text-primary)">Товари ({order.items?.length || 0})</h4>
                                    <div className="flex flex-col gap-2">
                                        {order.items?.map(item => {
                                            const opts = item.options ? (typeof item.options === 'string' ? JSON.parse(item.options) : item.options) : {};
                                            return (
                                                <div key={item.id} className="flex justify-between items-start text-sm p-3 border border-(--platform-border-color) rounded-lg bg-(--platform-bg)">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-(--platform-text-primary)">
                                                            {item.product_name}
                                                            {item.type === 'digital' && <span className="ml-2 text-[10px] bg-blue-500/10 text-blue-600 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase">Цифр.</span>}
                                                        </span>
                                                        {Object.entries(opts).length > 0 && (
                                                            <span className="text-xs text-(--platform-text-secondary) mt-1">
                                                                Опції: {Object.entries(opts).map(([k,v]) => `${k}=${v.label || v}`).join(', ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-right ml-4 shrink-0">
                                                        <div className="font-semibold">{item.quantity} шт.</div>
                                                        <div className="text-(--platform-text-secondary) text-xs">{parseFloat(item.price).toFixed(0)} ₴/шт.</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersTab;