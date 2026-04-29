// frontend/src/modules/shop/MyOrdersPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../shared/api/api';
import EmptyState from '../../shared/ui/complex/EmptyState';
import LoadingState from '../../shared/ui/complex/LoadingState';
import { Button } from '../../shared/ui/elements/Button';
import { Input } from '../../shared/ui/elements/Input';
import CustomSelect from '../../shared/ui/elements/CustomSelect';
import DateRangePicker from '../../shared/ui/elements/DateRangePicker';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../shared/config';
import { Package, Clock, CheckCircle, XCircle, CreditCard, ChevronDown, ChevronUp, AlertCircle, ExternalLink, Loader2, Store, Search } from 'lucide-react';

const STATUS_MAP = {
    pending: { label: 'Очікує оплати', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock },
    paid: { label: 'Оплачено', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CreditCard },
    shipped: { label: 'Відправлено', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Package },
    completed: { label: 'Виконано', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
    cancelled: { label: 'Скасовано', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle }
};

const FILTER_STATUS_OPTIONS = [
    { value: 'all', label: 'Всі статуси' },
    ...Object.entries(STATUS_MAP).map(([key, val]) => ({
        value: key,
        label: val.label
    }))
];

const SORT_FIELDS = [
    { value: 'date', label: 'За датою' },
    { value: 'amount', label: 'За сумою' },
    { value: 'id', label: 'За номером' }
];

const getImageUrl = (item) => {
    let gallery = item.product_image || item.image_gallery || item.image_path || item.image;
    let targetPath = null;
    if (Array.isArray(gallery) && gallery.length > 0) targetPath = gallery[0];
    else if (typeof gallery === 'string') {
        try {
            if (gallery.startsWith('[')) targetPath = JSON.parse(gallery)[0];
            else targetPath = gallery;
        } catch (e) { targetPath = gallery; }
    }
    if (!targetPath) return 'https://placehold.co/120x120?text=No+Image';
    if (targetPath.startsWith('http')) return targetPath;
    return `${BASE_URL}${targetPath.startsWith('/') ? targetPath : `/${targetPath}`}`;
};

const OrderCard = ({ order, onPay, resolvedPaths }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const statusConfig = STATUS_MAP[order.status] || STATUS_MAP.pending;
    const StatusIcon = statusConfig.icon;
    const siteLogin = resolvedPaths[order.site_id];
    const siteLinkBase = siteLogin ? `/site/${siteLogin}` : null;
    const currencyMap = {
        'UAH': '₴',
        'USD': '$',
        'EUR': '€'
    };
    const currencySymbol = currencyMap[order.currency] || '₴';
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} о ${hours}:${minutes}`;
    };

    const handlePayClick = async (e) => {
        e.stopPropagation();
        setIsPaying(true);
        await onPay(order.id);
        setIsPaying(false);
    };

    return (
        <div className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl overflow-hidden mb-4 transition-all hover:shadow-sm">
            <div 
                className="p-4 sm:p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start gap-3 sm:gap-4 flex-1">
                    <div className={`p-2.5 sm:p-3 rounded-full shrink-0 ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-1">
                            <h3 className="font-bold text-(--platform-text-primary) text-base sm:text-lg m-0">
                                Замовлення #{order.id}
                            </h3>
                            <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5">
                            <Store size={14} className="text-(--platform-text-secondary) shrink-0" />
                            {siteLogin ? (
                                <Link 
                                    to={siteLinkBase}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-(--platform-accent) hover:underline truncate max-w-50 sm:max-w-75"
                                    title="Перейти на сайт магазину"
                                >
                                    {order.site_name || siteLogin}
                                </Link>
                            ) : (
                                <span className="text-[11px] sm:text-xs text-(--platform-text-secondary) animate-pulse">
                                    Завантаження магазину...
                                </span>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-(--platform-text-secondary) m-0 mt-1.5 sm:mt-2">
                            {formatDate(order.created_at)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 md:w-auto w-full border-t md:border-t-0 pt-3 md:pt-0 border-(--platform-border-color)">
                    <div className="text-left md:text-right">
                        <p className="text-xs sm:text-sm text-(--platform-text-secondary) m-0 mb-0.5 sm:mb-1">Сума</p>
                        <p className="font-bold text-(--platform-text-primary) text-base sm:text-lg m-0">
                            {parseFloat(order.total_amount).toFixed(0)} {currencySymbol}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 ml-auto md:ml-0">
                        {order.status === 'pending' && (
                            <Button 
                                onClick={handlePayClick} 
                                disabled={isPaying}
                                className="bg-orange-600 hover:bg-orange-700 text-white shrink-0 border-none shadow-md transition-colors text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4"
                            >
                                {isPaying ? <Loader2 className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> : <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />}
                                Оплатити
                            </Button>
                        )}
                        <div className="text-(--platform-text-secondary) shrink-0">
                            {isExpanded ? <ChevronUp size={20} className="sm:w-6 sm:h-6" /> : <ChevronDown size={20} className="sm:w-6 sm:h-6" />}
                        </div>
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div className="border-t border-(--platform-border-color) bg-(--platform-bg) p-4 sm:p-5 animate-in slide-in-from-top-2 duration-200">
                    {order.status === 'pending' && order.items.some(i => i.type === 'digital') && (
                        <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-lg flex gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500">
                            <AlertCircle className="shrink-0 mt-0.5" size={18} />
                            <div className="text-xs sm:text-sm">
                                <p className="font-semibold mb-1 m-0">У замовленні є цифрові товари</p>
                                <p className="m-0">Оплатіть замовлення, щоб отримати доступ до посилань або файлів.</p>
                            </div>
                        </div>
                    )}
                    <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 mb-4 sm:mb-6">
                        <div className="lg:col-span-2">
                            <h4 className="font-semibold text-(--platform-text-primary) mb-3 text-xs sm:text-sm uppercase tracking-wider opacity-80">
                                Товари ({order.items.length})
                            </h4>
                            <div className="space-y-3 sm:space-y-4">
                                {order.items.map(item => {
                                    const options = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
                                    const isUrl = item.digital_file_url?.startsWith('http');
                                    return (
                                        <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start transition-colors bg-(--platform-card-bg) rounded-xl border border-(--platform-border-color) shadow-sm">
                                            <div className="flex gap-3 sm:gap-4 w-full sm:w-auto sm:flex-1 min-w-0">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-(--platform-bg) rounded-lg border border-(--platform-border-color) overflow-hidden shrink-0 flex items-center justify-center">
                                                    <img src={getImageUrl(item)} alt={item.product_name} className="w-full h-full object-contain p-1.5 sm:p-2" />
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center sm:justify-start">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        {siteLogin ? (
                                                            <Link 
                                                                to={`${siteLinkBase}/product/${item.product_id}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="text-sm sm:text-base font-bold text-(--platform-text-primary) hover:text-(--platform-accent) transition-colors leading-tight"
                                                            >
                                                                {item.product_name}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-sm sm:text-base font-bold text-(--platform-text-primary) leading-tight">
                                                                {item.product_name}
                                                            </span>
                                                        )}
                                                        {item.type === 'digital' && (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-(--platform-bg)/90 backdrop-blur-md rounded-lg text-[0.65rem] sm:text-[0.7rem] uppercase tracking-wider font-bold shadow-sm border border-(--platform-border-color) text-(--platform-accent) align-middle mt-0.5 sm:mt-0">
                                                                Цифровий
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-1.5 flex flex-wrap gap-1.5 sm:gap-2">
                                                        {item.type !== 'digital' && options && Object.keys(options).length > 0 && Object.entries(options).map(([key, val]) => (
                                                            <span key={key} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-(--platform-bg) border border-(--platform-border-color) text-(--platform-text-secondary)">
                                                                {key}: <span className="font-semibold text-(--platform-text-primary)">{val.label || val}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="mt-2 sm:mt-3">
                                                        <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 bg-(--platform-bg) border border-(--platform-border-color) rounded-md text-[10px] sm:text-xs font-semibold text-(--platform-text-secondary)">
                                                            Кількість: <span className="text-(--platform-text-primary) ml-1">{item.quantity} шт.</span>
                                                        </span>
                                                    </div>
                                                    {item.type === 'digital' && item.digital_file_url && order.status !== 'pending' && (
                                                        <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-dashed border-(--platform-border-color) w-full">
                                                            {isUrl ? (
                                                                <a 
                                                                    href={item.digital_file_url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-(--platform-accent) hover:underline"
                                                                    onClick={e => e.stopPropagation()}
                                                                >
                                                                    <ExternalLink size={12} className="sm:w-3.5 sm:h-3.5" /> Переглянути / Завантажити
                                                                </a>
                                                            ) : (
                                                                <div>
                                                                    <p className="text-[10px] sm:text-xs text-(--platform-text-secondary) mb-1 m-0">Секретний код/текст:</p>
                                                                    <div className="bg-(--platform-bg) px-2 sm:px-3 py-1.5 sm:py-2 rounded text-[11px] sm:text-xs font-mono font-medium border border-(--platform-border-color) break-all text-(--platform-text-primary)">
                                                                        {item.digital_file_url}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 sm:pl-4 border-(--platform-border-color) flex flex-row sm:flex-col justify-between items-center sm:items-end gap-2 h-full mt-1 sm:mt-0">
                                                <div className="text-left sm:text-right">
                                                    {item.quantity > 1 && (
                                                        <p className="text-[10px] sm:text-xs text-(--platform-text-secondary) m-0 mb-0.5 sm:mb-1">
                                                            {parseFloat(item.price).toFixed(0)} {currencySymbol} / шт.
                                                        </p>
                                                    )}
                                                    <p className="text-base sm:text-lg font-bold text-(--platform-text-primary) m-0">
                                                        {(parseFloat(item.price) * item.quantity).toFixed(0)} {currencySymbol}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-(--platform-text-primary) mb-3 text-xs sm:text-sm uppercase tracking-wider opacity-80">
                                Деталі доставки
                            </h4>
                            <div className="bg-(--platform-card-bg) rounded-xl p-4 sm:p-5 border border-(--platform-border-color) text-xs sm:text-sm space-y-2 sm:space-y-3 shadow-sm">
                                <p className="m-0 flex flex-col gap-0.5">
                                    <span className="text-[10px] sm:text-xs text-(--platform-text-secondary) uppercase tracking-wider font-semibold">Отримувач:</span> 
                                    <span className="font-medium text-(--platform-text-primary) text-sm sm:text-base">{order.customer_name}</span>
                                </p>
                                <p className="m-0 flex flex-col gap-0.5">
                                    <span className="text-[10px] sm:text-xs text-(--platform-text-secondary) uppercase tracking-wider font-semibold">Телефон:</span> 
                                    <span className="font-medium text-(--platform-text-primary)">{order.customer_phone}</span>
                                </p>
                                <p className="m-0 flex flex-col gap-0.5">
                                    <span className="text-[10px] sm:text-xs text-(--platform-text-secondary) uppercase tracking-wider font-semibold">Email:</span> 
                                    <span className="font-medium text-(--platform-text-primary)">{order.customer_email}</span>
                                </p>
                                <hr className="my-2.5 sm:my-3 border-(--platform-border-color)" />
                                <p className="m-0 flex flex-col gap-0.5">
                                    <span className="text-[10px] sm:text-xs text-(--platform-text-secondary) uppercase tracking-wider font-semibold">Адреса доставки:</span>
                                    <span className="font-medium text-(--platform-text-primary)">{order.delivery_address || 'Не вказана (Цифровий товар)'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resolvedPaths, setResolvedPaths] = useState({});
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await apiClient.get('/orders/my');
                setOrders(res.data);
            } catch (error) {
                console.error('Помилка завантаження замовлень', error);
                toast.error('Не вдалося завантажити історію замовлень');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    useEffect(() => {
        const fetchPaths = async () => {
            const missingIds = orders
                .map(order => order.site_id)
                .filter(id => id && !resolvedPaths[id]);
            const uniqueMissingIds = [...new Set(missingIds)];
            if (uniqueMissingIds.length === 0) return;
            const newPaths = { ...resolvedPaths };
            for (const id of uniqueMissingIds) {
                try {
                    const res = await apiClient.get(`/sites/info/${id}`);
                    if (res.data && res.data.site_path) {
                        newPaths[id] = res.data.site_path;
                    }
                } catch (e) {
                    console.error("Помилка завантаження site_path для id:", id);
                }
            }
            setResolvedPaths(newPaths);
        };
        if (orders.length > 0) {
            fetchPaths();
        }
    }, [orders]);

    const clearDateFilter = () => {
        setStartDate('');
        setEndDate('');
    };

    const processedOrders = useMemo(() => {
        let result = [...orders];
        if (search.trim()) {
            const query = search.toLowerCase();
            result = result.filter(o => {
                const siteName = (o.site_name || o.site_title || resolvedPaths[o.site_id] || '').toLowerCase();
                const idMatch = o.id.toString().toLowerCase().includes(query);
                const siteMatch = siteName.includes(query);
                const itemMatch = o.items && o.items.some(item => (item.product_name || '').toLowerCase().includes(query));
                return idMatch || siteMatch || itemMatch;
            });
        }
        if (statusFilter !== 'all') {
            result = result.filter(o => o.status === statusFilter);
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
    }, [orders, search, statusFilter, startDate, endDate, sortBy, sortOrder, resolvedPaths]);

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const handlePayExistingOrder = async (orderId) => {
        try {
            const response = await apiClient.post(`/orders/${orderId}/pay`);
            if (response.data && response.data.data && response.data.signature) {
                const { data, signature } = response.data;
                const form = document.createElement("form");
                form.method = "POST";
                form.action = "https://www.liqpay.ua/api/3/checkout";
                const dataInput = document.createElement("input");
                dataInput.type = "hidden";
                dataInput.name = "data";
                dataInput.value = data;
                const signatureInput = document.createElement("input");
                signatureInput.type = "hidden";
                signatureInput.name = "signature";
                signatureInput.value = signature;
                form.appendChild(dataInput);
                form.appendChild(signatureInput);
                document.body.appendChild(form);
                form.submit();
            }
        } catch (error) {
            console.error('Помилка створення оплати:', error);
            toast.error(error.response?.data?.message || 'Не вдалося створити платіж. Спробуйте пізніше.');
        }
    };

    if (loading) {
        return <LoadingState layout="page" />;
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full h-full flex flex-col">
            <div className="shrink-0 mb-5 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-(--platform-text-primary) flex items-center gap-2 sm:gap-3">
                    <Package className="text-(--platform-accent) w-6 h-6 sm:w-8 sm:h-8" /> Мої замовлення
                </h1>
            </div>
            {orders.length === 0 ? (
                <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                    <EmptyState 
                        icon={Package}
                        title="У вас ще немає замовлень"
                        description="Зробіть свою першу покупку в каталозі сайтів, і вона з'явиться тут."
                    />
                </div>
            ) : (
                <>
                    <div className="mb-6 p-4 sm:p-5 bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl flex flex-col gap-3 sm:gap-4 shadow-sm">
                        
                        <div className="w-full">
                            <Input
                                leftIcon={<Search size={16} />}
                                placeholder="Пошук за номером, магазином або товаром..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                wrapperStyle={{ margin: 0 }}
                                debounceTime={400}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full">
                            <div className="w-full sm:w-auto flex-1">
                                <DateRangePicker 
                                    startDate={startDate}
                                    endDate={endDate}
                                    onStartDateChange={setStartDate}
                                    onEndDateChange={setEndDate}
                                    onClear={clearDateFilter}
                                />
                            </div>
                            <div className="flex flex-row gap-3 w-full sm:w-auto">
                                <div className="flex-1 sm:w-36 md:w-44">
                                    <CustomSelect
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        options={FILTER_STATUS_OPTIONS}
                                    />
                                </div>
                                <div className="flex-1 sm:w-32 md:w-40">
                                    <CustomSelect
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        options={SORT_FIELDS}
                                    />
                                </div>
                                <Button 
                                    variant="outline" 
                                    onClick={toggleSortOrder} 
                                    className="w-10 h-10 sm:w-10.5 sm:h-10.5 p-0 flex items-center justify-center shrink-0"
                                    title={sortOrder === 'desc' ? "За спаданням" : "За зростанням"}
                                >
                                    <span className="text-lg leading-none">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                    {processedOrders.length === 0 ? (
                        <div className="py-10 flex flex-col items-center">
                            <EmptyState 
                                title="Замовлень не знайдено"
                                description="За вашим запитом або фільтрами нічого не знайдено."
                                icon={Search}
                                action={
                                    (search || statusFilter !== 'all' || startDate || endDate) && (
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => { setSearch(''); setStatusFilter('all'); clearDateFilter(); }}
                                        >
                                            Очистити фільтри
                                        </Button>
                                    )
                                }
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {processedOrders.map(order => (
                                <OrderCard 
                                    key={order.id} 
                                    order={order} 
                                    onPay={handlePayExistingOrder}
                                    resolvedPaths={resolvedPaths}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MyOrdersPage;