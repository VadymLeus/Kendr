// frontend/src/modules/shop/MyOrdersPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../shared/api/api';
import EmptyState from '../../shared/ui/complex/EmptyState';
import LoadingState from '../../shared/ui/complex/LoadingState';
import { Button } from '../../shared/ui/elements/Button';
import { Input } from '../../shared/ui/elements/Input';
import CustomSelect from '../../shared/ui/elements/CustomSelect';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../shared/config';
import { Package, Clock, CheckCircle, XCircle, CreditCard, ChevronDown, ChevronUp, AlertCircle, ExternalLink, Loader2, Download, Store, Search } from 'lucide-react';

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
                className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-full shrink-0 ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                            <h3 className="font-bold text-(--platform-text-primary) text-lg m-0">
                                Замовлення #{order.id}
                            </h3>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Store size={14} className="text-(--platform-text-secondary)" />
                            {siteLogin ? (
                                <Link 
                                    to={siteLinkBase}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs font-bold uppercase tracking-wider text-(--platform-accent) hover:underline"
                                    title="Перейти на сайт магазину"
                                >
                                    {order.site_name || siteLogin}
                                </Link>
                            ) : (
                                <span className="text-xs text-(--platform-text-secondary) animate-pulse">
                                    Завантаження магазину...
                                </span>
                            )}
                        </div>
                        
                        <p className="text-sm text-(--platform-text-secondary) m-0 mt-2">
                            {formatDate(order.created_at)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-6 md:w-auto w-full border-t md:border-t-0 pt-4 md:pt-0 border-(--platform-border-color)">
                    <div className="text-left md:text-right">
                        <p className="text-sm text-(--platform-text-secondary) m-0 mb-1">Сума</p>
                        <p className="font-bold text-(--platform-text-primary) text-lg m-0">
                            {parseFloat(order.total_amount).toFixed(0)} ₴
                        </p>
                    </div>
                    {order.status === 'pending' && (
                        <Button 
                            onClick={handlePayClick} 
                            disabled={isPaying}
                            className="bg-orange-600 hover:bg-orange-700 text-white shrink-0 border-none shadow-md transition-transform hover:-translate-y-0.5"
                        >
                            {isPaying ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                            Оплатити зараз
                        </Button>
                    )}
                    <div className="text-(--platform-text-secondary)">
                        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div className="border-t border-(--platform-border-color) bg-(--platform-bg) p-5 animate-in slide-in-from-top-2 duration-200">
                    {order.status === 'pending' && order.items.some(i => i.type === 'digital') && (
                        <div className="mb-6 p-4 rounded-lg flex gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500">
                            <AlertCircle className="shrink-0 mt-0.5" size={20} />
                            <div className="text-sm">
                                <p className="font-semibold mb-1 m-0">У замовленні є цифрові товари</p>
                                <p className="m-0">Оплатіть замовлення, щоб отримати доступ до посилань та файлів.</p>
                            </div>
                        </div>
                    )}
                    <div className="grid lg:grid-cols-3 gap-8 mb-6">
                        <div className="lg:col-span-2">
                            <h4 className="font-semibold text-(--platform-text-primary) mb-3 text-sm uppercase tracking-wider opacity-80">Товари ({order.items.length})</h4>
                            <div className="space-y-4">
                                {order.items.map(item => {
                                    const options = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
                                    const isUrl = item.digital_file_url?.startsWith('http');
                                    return (
                                        <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start transition-colors bg-(--platform-card-bg) rounded-xl border border-(--platform-border-color) shadow-sm">
                                            <div className="w-20 h-20 bg-(--platform-bg) rounded-lg border border-(--platform-border-color) overflow-hidden shrink-0 flex items-center justify-center">
                                                <img src={getImageUrl(item)} alt={item.product_name} className="w-full h-full object-contain p-2" />
                                            </div>
                                            <div className="flex-1 min-w-0 w-full">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    {siteLogin ? (
                                                        <Link 
                                                            to={`${siteLinkBase}/product/${item.product_id}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-base font-bold text-(--platform-text-primary) hover:text-(--platform-accent) transition-colors"
                                                        >
                                                            {item.product_name}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-base font-bold text-(--platform-text-primary)">
                                                            {item.product_name}
                                                        </span>
                                                    )}
                                                    
                                                    {item.type === 'digital' && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-(--platform-bg)/90 backdrop-blur-md rounded-lg text-[0.7rem] uppercase tracking-wider font-bold shadow-sm border border-(--platform-border-color) text-(--platform-accent) align-middle">
                                                            <Download size={12}/> Цифровий
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {item.type !== 'digital' && options && Object.keys(options).length > 0 && Object.entries(options).map(([key, val]) => (
                                                        <span key={key} className="text-xs px-2 py-1 rounded bg-(--platform-bg) border border-(--platform-border-color) text-(--platform-text-secondary)">
                                                            {key}: <span className="font-semibold text-(--platform-text-primary)">{val.label || val}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="mt-3">
                                                    <span className="inline-flex items-center px-2.5 py-1 bg-(--platform-bg) border border-(--platform-border-color) rounded-md text-xs font-semibold text-(--platform-text-secondary)">
                                                        Кількість: <span className="text-(--platform-text-primary) ml-1">{item.quantity} шт.</span>
                                                    </span>
                                                </div>
                                                {item.type === 'digital' && item.digital_file_url && order.status !== 'pending' && (
                                                    <div className="mt-4 pt-3 border-t border-dashed border-(--platform-border-color)">
                                                        {isUrl ? (
                                                            <a 
                                                                href={item.digital_file_url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--platform-accent) hover:underline"
                                                                onClick={e => e.stopPropagation()}
                                                            >
                                                                <ExternalLink size={14} /> Переглянути / Завантажити
                                                            </a>
                                                        ) : (
                                                            <div>
                                                                <p className="text-xs text-(--platform-text-secondary) mb-1 m-0">Секретний код/текст:</p>
                                                                <div className="bg-(--platform-bg) px-3 py-2 rounded text-xs font-mono font-medium border border-(--platform-border-color) break-all text-(--platform-text-primary)">
                                                                    {item.digital_file_url}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="shrink-0 min-w-28 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 sm:pl-4 border-(--platform-border-color) flex flex-row sm:flex-col justify-between items-center sm:items-end gap-2 h-full">
                                                <div className="text-left sm:text-right">
                                                    {item.quantity > 1 && (
                                                        <p className="text-xs text-(--platform-text-secondary) m-0 mb-1">
                                                            {parseFloat(item.price).toFixed(0)} ₴ / шт.
                                                        </p>
                                                    )}
                                                    <p className="text-lg font-bold text-(--platform-text-primary) m-0">
                                                        {(parseFloat(item.price) * item.quantity).toFixed(0)} ₴
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-(--platform-text-primary) mb-3 text-sm uppercase tracking-wider opacity-80">Деталі доставки</h4>
                            <div className="bg-(--platform-card-bg) rounded-xl p-5 border border-(--platform-border-color) text-sm space-y-3 shadow-sm">
                                <p className="m-0 flex flex-col gap-0.5">
                                    <span className="text-xs text-(--platform-text-secondary) uppercase tracking-wider font-semibold">Отримувач:</span> 
                                    <span className="font-medium text-(--platform-text-primary) text-base">{order.customer_name}</span>
                                </p>
                                <p className="m-0 flex flex-col gap-0.5">
                                    <span className="text-xs text-(--platform-text-secondary) uppercase tracking-wider font-semibold">Телефон:</span> 
                                    <span className="font-medium text-(--platform-text-primary)">{order.customer_phone}</span>
                                </p>
                                <p className="m-0 flex flex-col gap-0.5">
                                    <span className="text-xs text-(--platform-text-secondary) uppercase tracking-wider font-semibold">Email:</span> 
                                    <span className="font-medium text-(--platform-text-primary)">{order.customer_email}</span>
                                </p>
                                <hr className="my-3 border-(--platform-border-color)" />
                                <p className="m-0 flex flex-col gap-0.5">
                                    <span className="text-xs text-(--platform-text-secondary) uppercase tracking-wider font-semibold">Адреса доставки:</span>
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

    const processedOrders = useMemo(() => {
        let result = [...orders];
        if (search.trim()) {
            const query = search.toLowerCase();
            result = result.filter(o => {
                const siteName = (o.site_name || o.site_title || resolvedPaths[o.site_id] || '').toLowerCase();
                const idMatch = o.id.toString().includes(query);
                const siteMatch = siteName.includes(query);
                const itemMatch = o.items && o.items.some(item => (item.product_name || '').toLowerCase().includes(query));
                return idMatch || siteMatch || itemMatch;
            });
        }
        if (statusFilter !== 'all') {
            result = result.filter(o => o.status === statusFilter);
        }
        result.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'date') {
                comparison = new Date(a.created_at) - new Date(b.created_at);
            } else if (sortBy === 'amount') {
                comparison = parseFloat(a.total_amount) - parseFloat(b.total_amount);
            } else if (sortBy === 'id') {
                comparison = a.id - b.id;
            }
            return sortOrder === 'asc' ? comparison : comparison * -1;
        });

        return result;
    }, [orders, search, statusFilter, sortBy, sortOrder, resolvedPaths]);
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
            <h1 className="text-2xl font-bold mb-6 text-(--platform-text-primary) flex items-center gap-3 shrink-0">
                <Package className="text-(--platform-accent)" /> Мої замовлення
            </h1>
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
                    <div className="mb-6 p-4 bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
                        <div className="flex-1 min-w-60">
                            <Input
                                leftIcon={<Search size={16} />}
                                placeholder="Пошук за номером, магазином або товаром..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                wrapperStyle={{ margin: 0 }}
                                debounceTime={400}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            <div className="w-44">
                                <CustomSelect
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    options={FILTER_STATUS_OPTIONS}
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
                        <div className="py-10 flex flex-col items-center">
                            <EmptyState 
                                title="Замовлень не знайдено"
                                description="За вашим запитом або фільтрами нічого не знайдено."
                                icon={Search}
                                action={
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => { setSearch(''); setStatusFilter('all'); }}
                                    >
                                        Очистити фільтри
                                    </Button>
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